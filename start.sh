#!/bin/bash
cd functions
npm start &
cd ..
cd admin 
npm start & 
cd ..
cd user
npm start & 
cd ..
