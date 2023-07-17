#!/bin/bash

BASE_DIR=$(cd $(dirname $0); pwd)

WORK_DIR="${BASE_DIR}/onnx_tmp"
PROTOBUF_VERSION="3.20.1"
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

if [ ! -f "${WORK_DIR}/.gitignore" ]; then
    echo "*" > "${WORK_DIR}/.gitignore"
fi

# Create protocol buffer lib
function createProtocolBuffer () {
    PROTOC="${WORK_DIR}/bin/protoc"
    if [ ! -f "$PROTOC" ]; then
        wget -P "${WORK_DIR}/" https://github.com/protocolbuffers/protobuf/releases/download/v${PROTOBUF_VERSION}/protoc-${PROTOBUF_VERSION}-linux-x86_64.zip
        unzip "${WORK_DIR}/protoc-${PROTOBUF_VERSION}-linux-x86_64.zip" -d ${WORK_DIR}
    fi

    if [ ! -f "${WORK_DIR}/package.json" ]; then
        echo "{}" > "${WORK_DIR}/package.json"
    fi
    npm install --prefix "${WORK_DIR}" \
      @types/google-protobuf \
      google-protobuf \
      ts-protoc-gen \
      rollup \
      @rollup/plugin-commonjs \
      @rollup/plugin-node-resolve

    PROTOC_GEN_TS="${WORK_DIR}/node_modules/.bin/protoc-gen-ts"
    ROLLUP="${WORK_DIR}/node_modules/.bin/rollup"

    if [ ! -d "${WORK_DIR}/onnx" ]; then
        git clone https://github.com/onnx/onnx.git "${WORK_DIR}/onnx"
    fi

    "$PROTOC" --proto_path="${WORK_DIR}/onnx/onnx" \
      --plugin="protoc-gen-ts=${PROTOC_GEN_TS}" \
      --js_out="import_style=commonjs,binary:${WORK_DIR}" \
      --ts_out="${WORK_DIR}" \
      "${WORK_DIR}/onnx/onnx/onnx.proto"
    if [ $? -ne 0 ]; then
        exit 1
    fi

    "$ROLLUP" \
      --input "${WORK_DIR}/onnx_pb.js" \
      --file "${LIB_ONNX_DIR}/onnx_pb.js" \
      --format "esm" \
      --plugin "@rollup/plugin-commonjs" \
      --plugin "@rollup/plugin-node-resolve"
    if [ $? -ne 0 ]; then
        exit 1
    fi
    sed -i "1ivar window = typeof window !== 'undefined' ? window : null; var self = typeof self !== 'undefined' ? self : null;" "${LIB_ONNX_DIR}/onnx_pb.js"

    cp "${WORK_DIR}/onnx_pb.d.ts" "${LIB_ONNX_DIR}"
    sed -i -e 's/"google-protobuf"/".\/google-protobuf.js"/' "${LIB_ONNX_DIR}/onnx_pb.d.ts"
    cp "${WORK_DIR}/node_modules/@types/google-protobuf/index.d.ts" "${LIB_ONNX_DIR}/google-protobuf.d.ts"
}

# Make onnx files
function makeOnnxFiles () {
    if [ ! -d "${WORK_DIR}/onnx" ]; then
        git clone https://github.com/onnx/onnx.git "${WORK_DIR}/onnx"
    fi

    rm -f "${TEST_ONNX_DIR}"/**/*.onnx
    rm -f "${TEST_ONNX_DIR}"/*.onnx

    if [ ! -f "${TEST_ONNX_DIR}/.gitignore" ]; then
        echo -e ".gitignore\n*.onnx" > "${TEST_ONNX_DIR}/.gitignore"
    fi

    mkdir -p "${TEST_ONNX_DIR}/models"

    ONNX_MODELS_URL="https://github.com/onnx/models"
    models=(
        "vision/classification/mnist/model/mnist-12.onnx"
        "vision/classification/squeezenet/model/squeezenet1.0-12.onnx"
    )
    for modelPath in "${models[@]}" ; do
        wget -q --show-progress -O "${TEST_ONNX_DIR}/models/${modelPath##*/}" "${ONNX_MODELS_URL}/blob/main/${modelPath}?raw=true"
    done

    cat << EOS > "${WORK_DIR}/docker-compose.yml"
version: '3'
services:
  create-onnx:
    image: python:3.11.2-slim
    volumes:
      - ${WORK_DIR}:/app
      - ${BASE_DIR}:/root_dir
    working_dir: /app
    entrypoint:
      - bash
      - -c
      - >
        pip install --upgrade pip
        && pip install black numpy onnx
        && pip install torch --index-url https://download.pytorch.org/whl/cpu
        && black /root_dir/tests/lib/model/nns/onnx
        && python /app/create_onnx.py
EOS

    cat << EOS > "${WORK_DIR}/create_onnx.py"
from glob import glob
import importlib.util
import os
import sys
import traceback
failed_scripts = ''
for filepath in glob('/root_dir/tests/lib/model/nns/onnx/**/*.py', recursive=True):
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
    if spec.cached and os.path.exists(spec.cached):
        os.remove(spec.cached)
if len(failed_scripts) > 0:
    print(f'There are failed scripts!{failed_scripts}', file=sys.stderr)
    sys.exit(1)
EOS

    sudo docker-compose -f "${WORK_DIR}/docker-compose.yml" up create-onnx
}

if [ $TEST_MODE -eq 0 ]; then
    createProtocolBuffer
fi
makeOnnxFiles
