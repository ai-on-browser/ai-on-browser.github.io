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
    export PYENV_ROOT="${WORK_DIR}/.pyenv"
    PYENV="${PYENV_ROOT}/bin/pyenv"
    PYENV_PYTHON_VERSION=miniconda3-latest
    if [ ! -d "${PYENV_ROOT}" ]; then
        git clone https://github.com/pyenv/pyenv.git "${PYENV_ROOT}"
        pushd "${PYENV_ROOT}"
        src/configure && make -C src
        popd

        sudo apt update
        sudo apt -y install build-essential libssl-dev zlib1g-dev \
            libbz2-dev libreadline-dev libsqlite3-dev curl \
            libncursesw5-dev xz-utils tk-dev libxml2-dev libxmlsec1-dev libffi-dev liblzma-dev
        "$PYENV" install "$PYENV_PYTHON_VERSION"
    fi
    eval "$(${PYENV} init --path)"
    "$PYENV" local "$PYENV_PYTHON_VERSION"
    pip install --upgrade pip
    pip install --no-cache black numpy onnx
    pip install --no-cache torch --index-url https://download.pytorch.org/whl/cpu
    black "${TEST_ONNX_DIR}"

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
        wget -q --show-progress -O "${TEST_ONNX_DIR}/models/${modelPath##*/}" "${ONNX_MODELS_URL}/blob/main/${modelPath}?raw=true"
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

    python "${WORK_DIR}/create_onnx.py"
}

if [ $TEST_MODE -eq 0 ]; then
    createProtocolBuffer
fi
makeOnnxFiles
