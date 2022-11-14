#!/bin/bash

BASE_DIR=$(cd $(dirname $0); pwd)

WORK_DIR="${BASE_DIR}/onnx_tmp"
PROTOBUF_VERSION="3.20.1"
PROTOC="${WORK_DIR}/bin/protoc"
OUT_DIR="${BASE_DIR}/lib/model/nns/onnx"
PROTOC_GEN_TS_PATH="${WORK_DIR}/node_modules/.bin/protoc-gen-ts"
ROLLUP_PATH="${WORK_DIR}/node_modules/.bin/rollup"
MODEL_DIR="${BASE_DIR}/tests/lib/model/nns/onnx/models"

# Initialize

if [ ! -d "$WORK_DIR" ]; then
    mkdir "$WORK_DIR"
fi

if [ ! -d "$OUT_DIR" ]; then
    mkdir "$OUT_DIR"
fi

if [ ! -f "${WORK_DIR}/.gitignore" ]; then
    echo "*" > "${WORK_DIR}/.gitignore"
fi

# Create protocol buffer lib

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

if [ ! -d "${WORK_DIR}/onnx" ]; then
    git clone https://github.com/onnx/onnx.git "${WORK_DIR}/onnx"
fi

"$PROTOC" --proto_path="${WORK_DIR}/onnx/onnx" \
  --plugin="protoc-gen-ts=${PROTOC_GEN_TS_PATH}" \
  --js_out="import_style=commonjs,binary:${WORK_DIR}" \
  --ts_out="${WORK_DIR}" \
  "${WORK_DIR}/onnx/onnx/onnx.proto"

"$ROLLUP_PATH" \
  --input "${WORK_DIR}/onnx_pb.js" \
  --file "${OUT_DIR}/onnx_pb.js" \
  --format "esm" \
  --plugin "@rollup/plugin-commonjs" \
  --plugin "@rollup/plugin-node-resolve"
sed -i "1ivar window = typeof window !== 'undefined' ? window : null; var self = typeof self !== 'undefined' ? self : null;" "${OUT_DIR}/onnx_pb.js"

cp "${WORK_DIR}/onnx_pb.d.ts" "${OUT_DIR}"
sed -i -e 's/"google-protobuf"/".\/google-protobuf.js"/' "${OUT_DIR}/onnx_pb.d.ts"
cp "${WORK_DIR}/node_modules/@types/google-protobuf/index.d.ts" "${OUT_DIR}/google-protobuf.d.ts"

# Make onnx files

rm -f "${BASE_DIR}"/tests/lib/model/nns/onnx/**/*.onnx
rm -f "${BASE_DIR}"/tests/lib/model/nns/onnx/*.onnx

if [ ! -f "${BASE_DIR}/tests/lib/model/nns/onnx/.gitignore" ]; then
    echo -e ".gitignore\n*.onnx" > "${BASE_DIR}/tests/lib/model/nns/onnx/.gitignore"
fi

if [ ! -d "$MODEL_DIR" ]; then
    mkdir "$MODEL_DIR"
fi

ONNX_MODELS_URL="https://github.com/onnx/models"

wget -q --show-progress -O "${MODEL_DIR}/mnist-12.onnx" "${ONNX_MODELS_URL}/blob/main/vision/classification/mnist/model/mnist-12.onnx?raw=true"

cat << EOS > "${WORK_DIR}/docker-compose.yml"
version: '3'
services:
  create-onnx:
    image: python:3.10.4-slim
    volumes:
      - ${WORK_DIR}:/app
      - ${BASE_DIR}:/root_dir
    working_dir: /app
    entrypoint:
      - bash
      - enrtypoint.sh
EOS

cat << EOS > "${WORK_DIR}/enrtypoint.sh"
#!/bin/bash
pip install --upgrade pip
pip install black numpy torch onnx

black /root_dir/tests/lib/model/nns/onnx

python /app/create_onnx.py
EOS

cat << EOS > "${WORK_DIR}/create_onnx.py"
from glob import glob
import importlib.util
import os
import sys
import traceback
for filepath in glob('/root_dir/tests/lib/model/nns/onnx/**/*.py', recursive=True):
    modname = os.path.splitext(os.path.basename(filepath))[0]
    print(f'Call {filepath}')
    modpath = f'operators.{modname}'
    spec = importlib.util.spec_from_file_location(modpath, filepath)
    mod = importlib.util.module_from_spec(spec)
    sys.modules[modpath] = mod
    try:
        spec.loader.exec_module(mod)
    except Exception as e:
        traceback.print_exception(e)
    if spec.cached and os.path.exists(spec.cached):
        os.remove(spec.cached)
EOS

sudo docker-compose -f "${WORK_DIR}/docker-compose.yml" up create-onnx
