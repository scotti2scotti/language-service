#!/usr/bin/env bash

source ./.envrc
unset ${LD_PRELOAD}

function setup_java() {
  if [ -d ${JDK_DIR} ]; then return; fi;
  echo Installing ${JDK_TAR}
  wget https://download.java.net/java/GA/jdk12.0.2/e482c34c86bd4bf8b56c0b35558996b9/10/GPL/${JDK_TAR}
  tar zxf ${JDK_TAR} -C ${LIB_DIR}
  rm ${JDK_TAR}
}

function setup_maven() {
  if [ -d ${MAVEN_DIR} ]; then return; fi;
  echo Installing ${MAVEN_TAR}
  wget http://us.mirrors.quenda.co/apache/maven/maven-3/3.6.1/binaries/${MAVEN_TAR}
  tar zxf ${MAVEN_TAR} -C ${LIB_DIR}
  rm ${MAVEN_TAR}
}


function setup_cld2() {
  if [ -f ${CLD2_LIB_DIR}/libcld2_full.so ]; then return; fi;
  echo Installing ${CLD2_REPO}
  git clone ${CLD2_REPO}
  cd ${CLD2_LIB_DIR}
  CFLAGS="-Wno-narrowing -O3" ./compile_and_test_all.sh
  cd ${ROOT}
  echo export LD_LIBRARY_PATH=${CLD2_LIB_DIR} >> .envrc
  echo export LD_PRELOAD=${CLD2_LIB_DIR}/libcld2_full.so >> .envrc

}

function setup_cld2_java() {
  if [ -d ${CLD2_JAVA_DIR}/target ]; then return; fi;
  echo Installing ${CLD2_JAVA_REPO}
  git clone ${CLD2_JAVA_REPO}
  cd ${CLD2_JAVA_DIR}
  mvn install -Dmaven.test.skip=true
  cd ${ROOT}
}

setup() {
  setup_java
  setup_maven
  setup_cld2
  setup_cld2_java
}

setup
