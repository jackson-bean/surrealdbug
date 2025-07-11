#!/bin/bash

(cd app && bun dev) &
(cd dev && bun dev) &

wait