FROM ubuntu:18.04 AS builder

ENV ROOT_DIR /node
ENV BIN_DIR ${ROOT_DIR}/bin
ENV DATA_DIR ${ROOT_DIR}/data
ENV LIB_DIR ${ROOT_DIR}/lib

ENV JDK_VERSION 12.0.2
ENV JDK_TAR openjdk-12.0.2_linux-x64_bin.tar.gz 
ENV JDK_URL https://download.java.net/java/GA/jdk12.0.2/e482c34c86bd4bf8b56c0b35558996b9/10/GPL/${JDK_TAR}
ENV JDK_DIR ${BIN_DIR}/jdk-${JDK_VERSION}
ENV JDK_BIN_DIR ${JDK_DIR}/bin

ENV MAVEN_VERSION 3.6.1
ENV MAVEN_TAR apache-maven-3.6.1-bin.tar.gz
ENV MAVEN_URL  http://us.mirrors.quenda.co/apache/maven/maven-3/3.6.1/binaries/${MAVEN_TAR}
ENV MAVEN_DIR ${BIN_DIR}/apache-maven-${MAVEN_VERSION}
ENV MAVEN_BIN_DIR ${MAVEN_DIR}/bin

ENV CLD2_REPO https://github.com/CLD2Owners/cld2.git
ENV CLD2_COMMIT b56fa78a2fe44ac2851bae5bf4f4693a0644da7b
ENV CLD2_DIR ${DATA_DIR}/cld2
ENV CLD2_LIB_DIR ${CLD2_DIR}/internal
ENV CFLAGS "-Wno-narrowing -O3"

ENV CDL2_JAVA_REPO https://github.com/commoncrawl/language-detection-cld2.git
ENV CLD2_JAVA_DIR ${DATA_DIR}/cld2-java

ENV SERVICE_NAME language-service
ENV SERVICE_VERSION 0.0.1
ENV SERVICE_JAR ${SERVICE_NAME}-${SERVICE_VERSION}.jar
ENV SERVICE_DIR ${DATA_DIR}/${SERVICE_NAME}

RUN apt-get update
RUN apt-get install -y wget git g++

RUN mkdir -p ${BIN_DIR} ${DATA_DIR} ${LIB_DIR}

RUN git clone ${CLD2_REPO} ${CLD2_DIR}
WORKDIR ${CLD2_DIR}
RUN git checkout -b install ${CLD2_COMMIT}
WORKDIR ${CLD2_LIB_DIR}
RUN ./compile_and_test_all.sh

RUN for file in libcld2.so libcld2_full.so libcld2_dynamic.so; do mv ${file} ${LIB_DIR}; done
ENV LD_LIBRARY_PATH ${LIB_DIR}
ENV LD_PRELOAD ${LIB_DIR}/libcld2_full.so

RUN wget -O ${DATA_DIR}/${JDK_TAR} ${JDK_URL} 
RUN tar zxf ${DATA_DIR}/${JDK_TAR} -C ${BIN_DIR}

RUN wget -O ${DATA_DIR}/${MAVEN_TAR} ${MAVEN_URL}
RUN tar zxf ${DATA_DIR}/${MAVEN_TAR} -C ${BIN_DIR}

ENV JAVA_HOME ${JDK_DIR}
ENV MAVEN_HOME ${MAVEN_DIR}

ENV PATH ${JDK_BIN_DIR}:${MAVEN_BIN_DIR}:${PATH}

RUN git clone ${CDL2_JAVA_REPO} ${CLD2_JAVA_DIR}
WORKDIR ${CLD2_JAVA_DIR}
RUN mvn install -Dmaven.test.skip=true

COPY ./service ${SERVICE_DIR}
WORKDIR ${SERVICE_DIR}
RUN mvn package
RUN mv ./target/${SERVICE_JAR} ${LIB_DIR}

RUN rm -rf ${MAVEN_DIR}
RUN rm -rf ${DATA_DIR}

FROM ubuntu:18.04

ENV ROOT_DIR=/node
ENV BIN_DIR=${ROOT_DIR}/bin \
  LIB_DIR=${ROOT_DIR}/lib
ENV JDK_VERSION=12.0.2
ENV JDK_DIR=${BIN_DIR}/jdk-${JDK_VERSION}
ENV JDK_BIN_DIR=${JDK_DIR}/bin \
  JAVA_HOME=${JDK_DIR} \
  SERVICE_NAME=language-service \
  SERVICE_VERSION=0.0.1
ENV SERVICE_JAR=${SERVICE_NAME}-${SERVICE_VERSION}.jar \
  PATH=${JDK_BIN_DIR}:${PATH} \
  LD_LIBRARY_PATH=${LIB_DIR} \
  LD_PRELOAD=${LIB_DIR}/libcld2_full.so

COPY --from=builder ${ROOT_DIR} ${ROOT_DIR}

WORKDIR ${LIB_DIR}

ENTRYPOINT java -jar ${SERVICE_JAR}
