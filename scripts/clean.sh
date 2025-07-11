#!/bin/bash

(rm -rf dist) &
(cd entry && rm -rf dist) &
(cd app && rm -rf dist)

wait;