#!/usr/bin/env bash

set -u

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
PORT="${PORT:-3000}"
TIMESTAMP="$(date +"%Y%m%d-%H%M%S")"
OUTPUT_DIR="${ROOT_DIR}/evidence/dod-${TIMESTAMP}"
BASE_URL="http://localhost:${PORT}"

mkdir -p "${OUTPUT_DIR}"

REPORT_FILE="${OUTPUT_DIR}/DoD-report.md"
API_TABLE_FILE="${OUTPUT_DIR}/api-results-table.md"
SERVER_LOG="${OUTPUT_DIR}/server.log"

LINT_EXIT=0
BUILD_EXIT=0
TEST_EXIT=0
API_FAIL_COUNT=0
SERVER_PID=""

cleanup() {
  if [ -n "${SERVER_PID}" ] && kill -0 "${SERVER_PID}" 2>/dev/null; then
    kill "${SERVER_PID}" 2>/dev/null || true
    wait "${SERVER_PID}" 2>/dev/null || true
  fi
}

trap cleanup EXIT

run_cmd() {
  local name="$1"
  local cmd="$2"
  local log_file="$3"

  echo "[RUN] ${name}"
  (cd "${ROOT_DIR}" && eval "${cmd}") >"${log_file}" 2>&1
  return $?
}

write_header() {
  local commit_hash
  commit_hash="$(cd "${ROOT_DIR}" && git rev-parse --short HEAD)"
  cat >"${REPORT_FILE}" <<EOF
# DoD 測試報告

- 產生時間: $(date +"%Y-%m-%d %H:%M:%S")
- 專案路徑: \`${ROOT_DIR}\`
- Commit: \`${commit_hash}\`
- 測試 Port: \`${PORT}\`

## 一、品質檢查
EOF
}

append_quality_result() {
  local item="$1"
  local exit_code="$2"
  local log_name="$3"
  local status_text="✅ PASS"

  if [ "${exit_code}" -ne 0 ]; then
    status_text="❌ FAIL"
  fi

  {
    echo "- ${item}: ${status_text} (exit code: ${exit_code})"
    echo "  - log: \`${log_name}\`"
  } >>"${REPORT_FILE}"
}

start_server() {
  echo "[RUN] start server on ${BASE_URL}"
  (
    cd "${ROOT_DIR}" && \
      PORT="${PORT}" NODE_ENV=test node dist/app.js
  ) >"${SERVER_LOG}" 2>&1 &
  SERVER_PID=$!
}

wait_for_server() {
  local max_attempts=30
  local attempt=1
  local http_code=""

  while [ "${attempt}" -le "${max_attempts}" ]; do
    http_code="$(curl -s -o /dev/null -w "%{http_code}" "${BASE_URL}/api/services" || true)"
    if [ "${http_code}" = "200" ]; then
      return 0
    fi
    sleep 1
    attempt=$((attempt + 1))
  done

  return 1
}

init_api_table() {
  cat >"${API_TABLE_FILE}" <<EOF
| Case | Expected | Actual | Result |
|---|---:|---:|---|
EOF
}

append_api_row() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  local result="$4"

  echo "| ${name} | ${expected} | ${actual} | ${result} |" >>"${API_TABLE_FILE}"
}

call_api() {
  local case_name="$1"
  local expected_status="$2"
  local method="$3"
  local endpoint="$4"
  local body_payload="${5:-}"
  local auth_token="${6:-}"
  local body_file="$7"

  local tmp_body="${OUTPUT_DIR}/${body_file}"
  local http_code=""

  if [ -n "${body_payload}" ] && [ -n "${auth_token}" ]; then
    http_code="$(
      curl -sS -o "${tmp_body}" -w "%{http_code}" \
        -X "${method}" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${auth_token}" \
        -d "${body_payload}" \
        "${BASE_URL}${endpoint}"
    )"
  elif [ -n "${body_payload}" ]; then
    http_code="$(
      curl -sS -o "${tmp_body}" -w "%{http_code}" \
        -X "${method}" \
        -H "Content-Type: application/json" \
        -d "${body_payload}" \
        "${BASE_URL}${endpoint}"
    )"
  elif [ -n "${auth_token}" ]; then
    http_code="$(
      curl -sS -o "${tmp_body}" -w "%{http_code}" \
        -X "${method}" \
        -H "Authorization: Bearer ${auth_token}" \
        "${BASE_URL}${endpoint}"
    )"
  else
    http_code="$(
      curl -sS -o "${tmp_body}" -w "%{http_code}" \
        -X "${method}" \
        "${BASE_URL}${endpoint}"
    )"
  fi

  if [ "${http_code}" = "${expected_status}" ]; then
    append_api_row "${case_name}" "${expected_status}" "${http_code}" "✅ PASS"
    return 0
  fi

  append_api_row "${case_name}" "${expected_status}" "${http_code}" "❌ FAIL"
  API_FAIL_COUNT=$((API_FAIL_COUNT + 1))
  return 1
}

write_header

run_cmd "lint" "npm run lint" "${OUTPUT_DIR}/lint.log"
LINT_EXIT=$?
append_quality_result "npm run lint" "${LINT_EXIT}" "lint.log"

run_cmd "build" "npm run build" "${OUTPUT_DIR}/build.log"
BUILD_EXIT=$?
append_quality_result "npm run build" "${BUILD_EXIT}" "build.log"

run_cmd "test" "NODE_ENV=test PORT=${PORT} npm test" "${OUTPUT_DIR}/test.log"
TEST_EXIT=$?
append_quality_result "NODE_ENV=test PORT=${PORT} npm test" "${TEST_EXIT}" "test.log"

{
  echo
  echo "## 二、DoD API 驗證（手動流程自動化）"
} >>"${REPORT_FILE}"

init_api_table

if [ "${BUILD_EXIT}" -eq 0 ]; then
  start_server
  if wait_for_server; then
    REGISTER_EMAIL="dod-${TIMESTAMP}@example.com"
    REGISTER_PAYLOAD="{\"email\":\"${REGISTER_EMAIL}\",\"password\":\"password123\",\"name\":\"DoD User\"}"
    LOGIN_PAYLOAD="{\"email\":\"${REGISTER_EMAIL}\",\"password\":\"password123\"}"
    CREATE_PAYLOAD='{"name":"DoD Service","description":"DoD test service","price":880,"showTime":40}'
    UPDATE_PAYLOAD='{"name":"DoD Service Updated","price":990}'

    call_api "Register" "201" "POST" "/api/auth/register" "${REGISTER_PAYLOAD}" "" "api-register.json"
    call_api "Login" "200" "POST" "/api/auth/login" "${LOGIN_PAYLOAD}" "" "api-login.json"

    AUTH_TOKEN="$(jq -r '.data.token // empty' "${OUTPUT_DIR}/api-login.json" 2>/dev/null || true)"

    call_api "GET /services (public)" "200" "GET" "/api/services" "" "" "api-services-list.json"
    call_api "POST /services without token" "401" "POST" "/api/services" "${CREATE_PAYLOAD}" "" "api-services-create-unauthorized.json"
    call_api "POST /services with token" "201" "POST" "/api/services" "${CREATE_PAYLOAD}" "${AUTH_TOKEN}" "api-services-create.json"

    SERVICE_ID="$(jq -r '.data.id // empty' "${OUTPUT_DIR}/api-services-create.json" 2>/dev/null || true)"
    if [ -n "${SERVICE_ID}" ]; then
      call_api "PUT /services/:id with token" "200" "PUT" "/api/services/${SERVICE_ID}" "${UPDATE_PAYLOAD}" "${AUTH_TOKEN}" "api-services-update.json"
      call_api "DELETE /services/:id with token" "200" "DELETE" "/api/services/${SERVICE_ID}" "" "${AUTH_TOKEN}" "api-services-delete.json"
      call_api "GET deleted service" "404" "GET" "/api/services/${SERVICE_ID}" "" "" "api-services-get-deleted.json"
    else
      append_api_row "PUT /services/:id with token" "200" "N/A" "❌ FAIL (missing service id)"
      append_api_row "DELETE /services/:id with token" "200" "N/A" "❌ FAIL (missing service id)"
      append_api_row "GET deleted service" "404" "N/A" "❌ FAIL (missing service id)"
      API_FAIL_COUNT=$((API_FAIL_COUNT + 3))
    fi
  else
    append_api_row "Server startup" "200" "N/A" "❌ FAIL (server not ready)"
    API_FAIL_COUNT=$((API_FAIL_COUNT + 1))
  fi
else
  append_api_row "Server startup" "200" "N/A" "❌ SKIP (build failed)"
  API_FAIL_COUNT=$((API_FAIL_COUNT + 1))
fi

{
  cat "${API_TABLE_FILE}"
  echo
  echo "## 三、DoD 判定"
} >>"${REPORT_FILE}"

if [ "${LINT_EXIT}" -eq 0 ] && [ "${BUILD_EXIT}" -eq 0 ] && [ "${TEST_EXIT}" -eq 0 ] && [ "${API_FAIL_COUNT}" -eq 0 ]; then
  {
    echo "- 註冊/登入、服務 CRUD 功能正確執行: ✅"
    echo "- JWT 權限保護正常運作: ✅"
    echo "- 所有 API 端點可透過 Postman / API 流程驗證成功: ✅"
    echo "- 通過測試案例: ✅"
    echo
    echo "**總結：DoD 全部通過。**"
  } >>"${REPORT_FILE}"
  OVERALL_EXIT=0
else
  {
    echo "- 註冊/登入、服務 CRUD 功能正確執行: $( [ "${API_FAIL_COUNT}" -eq 0 ] && echo "✅" || echo "⚠️" )"
    echo "- JWT 權限保護正常運作: $( [ "${API_FAIL_COUNT}" -eq 0 ] && echo "✅" || echo "⚠️" )"
    echo "- 所有 API 端點可透過 Postman / API 流程驗證成功: $( [ "${API_FAIL_COUNT}" -eq 0 ] && echo "✅" || echo "⚠️" )"
    echo "- 通過測試案例: $( [ "${TEST_EXIT}" -eq 0 ] && echo "✅" || echo "❌" )"
    echo
    echo "**總結：DoD 未完全通過，請查看 logs 與 API 結果表。**"
  } >>"${REPORT_FILE}"
  OVERALL_EXIT=1
fi

echo
echo "Report generated:"
echo "- ${REPORT_FILE}"
echo "- ${OUTPUT_DIR}/lint.log"
echo "- ${OUTPUT_DIR}/build.log"
echo "- ${OUTPUT_DIR}/test.log"
echo "- ${OUTPUT_DIR}/server.log"

exit "${OVERALL_EXIT}"
