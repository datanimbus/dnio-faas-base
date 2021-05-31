#!/bin/bash

if [ ! $1 ]; then
  echo "Please provide release as argument"
  exit 0
fi

docker build -t data.stack:faas.base.$1 .
