@echo off
setlocal

node %~dp0..\lib\jslint.js %*
