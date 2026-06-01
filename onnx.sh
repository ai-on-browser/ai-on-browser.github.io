#!/bin/bash

BASE_DIR=$(cd $(dirname $0); pwd)

WORK_DIR="${BASE_DIR}/onnx_tmp"
PROTOBUF_VERSION="35.0"
LIB_ONNX_DIR="${BASE_DIR}/lib/model/nns/onnx"
TEST_ONNX_DIR="${BASE_DIR}/tests/lib/model/nns/onnx"

TEST_MODE=0

# getopts

while getopts t OPT
do
    case $OPT in
        t) TEST_MODE=1;;
    esac
done

# Initialize

mkdir -p "$WORK_DIR"
mkdir -p "$LIB_ONNX_DIR"

cd "$WORK_DIR"

if [ ! -f "${WORK_DIR}/.gitignore" ]; then
    echo "*" > "${WORK_DIR}/.gitignore"
fi

# Create protocol buffer lib
function createProtocolBuffer () {
    PROTOC="${WORK_DIR}/protoc/bin/protoc"
    if [ ! -f "$PROTOC" ]; then
        wget -P "${WORK_DIR}/" https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOBUF_VERSION}/protoc-${PROTOBUF_VERSION}-linux-x86_64.zip
        unzip "${WORK_DIR}/protoc-${PROTOBUF_VERSION}-linux-x86_64.zip" -d "${WORK_DIR}/protoc"
    fi

    if [ ! -f "${WORK_DIR}/package.json" ]; then
        echo "{}" > "${WORK_DIR}/package.json"
    fi
    npm install --prefix "${WORK_DIR}" \
      @types/google-protobuf \
      google-protobuf@3.21.4 \
      protoc-gen-js \
      ts-protoc-gen \
      rolldown

    PROTOC_GEN_JS="${WORK_DIR}/node_modules/.bin/protoc-gen-js"
    PROTOC_GEN_TS="${WORK_DIR}/node_modules/.bin/protoc-gen-ts"
    ROLLDOWN="${WORK_DIR}/node_modules/.bin/rolldown"

    if [ ! -d "${WORK_DIR}/onnx" ]; then
        git clone https://github.com/onnx/onnx.git "${WORK_DIR}/onnx"
    fi

    "$PROTOC" --proto_path="${WORK_DIR}/onnx/onnx" \
      --plugin="protoc-gen-ts=${PROTOC_GEN_TS}" \
      --plugin="protoc-gen-js=${PROTOC_GEN_JS}" \
      --js_out="import_style=commonjs,binary:${WORK_DIR}" \
      --ts_out="${WORK_DIR}" \
      "${WORK_DIR}/onnx/onnx/onnx.proto"
    if [ $? -ne 0 ]; then
        exit 1
    fi

    if [ ! -f "${LIB_ONNX_DIR}/onnx_pb.js" ]; then
        "$ROLLDOWN" \
        --input "${WORK_DIR}/onnx_pb.js" \
        --file "${LIB_ONNX_DIR}/onnx_pb.js"
        if [ $? -ne 0 ]; then
            exit 1
        fi
    fi

    cp "${WORK_DIR}/onnx_pb.d.ts" "${LIB_ONNX_DIR}"
    cp "${WORK_DIR}/node_modules/@types/google-protobuf/index.d.ts" "${LIB_ONNX_DIR}/google-protobuf.d.ts"
}

# Make onnx files
function makeOnnxFiles () {
    if [ ! -d "${WORK_DIR}/onnx" ]; then
        git clone https://github.com/onnx/onnx.git "${WORK_DIR}/onnx"
    fi
    UV_PROJECT_NAME=onnx_test_create
    PYTHON_VERSION=3.14.3
    if ! command -v uv >/dev/null 2>&1; then
        curl -LsSf https://astral.sh/uv/install.sh | sh
    fi
    uv self update
    if [ ! -d "${WORK_DIR}/${UV_PROJECT_NAME}" ]; then
        uv init -p ${PYTHON_VERSION} ${UV_PROJECT_NAME}
    fi
    cd "${WORK_DIR}/${UV_PROJECT_NAME}"
    uv add --index https://download.pytorch.org/whl/cpu torch
    uv add numpy onnx ruff
    uv run ruff check --fix "${TEST_ONNX_DIR}"
    uv run ruff format "${TEST_ONNX_DIR}"

    rm -f "${TEST_ONNX_DIR}"/**/*.onnx
    rm -f "${TEST_ONNX_DIR}"/*.onnx

    if [ ! -f "${TEST_ONNX_DIR}/.gitignore" ]; then
        echo -e ".gitignore\n*.onnx\n__pycache__" > "${TEST_ONNX_DIR}/.gitignore"
    fi

    mkdir -p "${TEST_ONNX_DIR}/models"

    ONNX_MODELS_URL="https://github.com/onnx/models"
    models=(
        "validated/vision/classification/mnist/model/mnist-12.onnx"
        "validated/vision/classification/squeezenet/model/squeezenet1.0-12.onnx"
    )
    for modelPath in "${models[@]}" ; do
        wget -q --show-progress -O "${TEST_ONNX_DIR}/models/${modelPath##*/}" "${ONNX_MODELS_URL}/raw/refs/heads/main/${modelPath}"
    done

    cat << EOS > "${WORK_DIR}/create_onnx.py"
from glob import glob
import importlib.util
import os
import sys
import traceback
failed_scripts = ''
for filepath in glob(f'${TEST_ONNX_DIR}/**/*.py', recursive=True):
    modname = os.path.splitext(os.path.basename(filepath))[0]
    print(f'Call {filepath}', flush=True)
    modpath = f'operators.{modname}'
    spec = importlib.util.spec_from_file_location(modpath, filepath)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[modpath] = mod
    try:
        spec.loader.exec_module(mod)
    except Exception as e:
        traceback.print_exception(e)
        failed_scripts += f'\n  {filepath}'
if len(failed_scripts) > 0:
    print(f'There are failed scripts!{failed_scripts}', file=sys.stderr)
    sys.exit(1)
EOS

    uv run "${WORK_DIR}/create_onnx.py"
}

if [ $TEST_MODE -eq 0 ]; then
    createProtocolBuffer
fi
makeOnnxFiles
