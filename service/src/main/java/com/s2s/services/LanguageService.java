package com.s2s.services;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.undertow.Undertow;
import io.undertow.server.handlers.BlockingHandler;
import io.undertow.server.HttpHandler;
import io.undertow.server.HttpServerExchange;
import io.undertow.server.RoutingHandler;
import io.undertow.util.Headers;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.net.URL;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;
import org.apache.tika.metadata.Metadata;
import org.apache.tika.Tika;
import org.commoncrawl.langdetect.cld2.Cld2;
import org.commoncrawl.langdetect.cld2.Result;

// important: load all the services!
import org.apache.tika.parser.*;


final class LanguageInfo {
  public final String text;
  public final Result language;
  public final Map<String, Object> meta;
  public LanguageInfo(final String text, final Result result, final Map<String, Object> meta) {
    this.text = text;
    this.language = result;
    this.meta = meta;
  }
}

/**
  Not following redirects, consider using
  https://hc.apache.org/httpcomponents-client-ga/httpclient/apidocs/
  taht does
*/
final class Handlers {
  public static final void stream(final HttpServerExchange exchange) throws Exception {
    try {
      final InputStream stream = exchange.getInputStream();
      final String json = Worker.readStream(stream);
      send(exchange, json);
    } catch (Exception e) {
      error(exchange, e);
    }
  }
  
  public static final void url(final HttpServerExchange exchange) throws Exception {
    try {
      final String url = exchange.getQueryParameters().get("url").getFirst();
      final String json = Worker.readStream(new URL(url).openStream());
      send(exchange, json);
    } catch (Exception e) {
      error(exchange, e);
    }
  }

  private static final void send(final HttpServerExchange exchange, final String json) throws Exception {
    try {
      exchange.getResponseHeaders().put(Headers.CONTENT_TYPE, "application/json");
      exchange.getResponseSender().send(json);
    } catch (Exception e) {
      error(exchange, e);
    }
  }

  private static final void error(final HttpServerExchange exchange, final Exception e) throws Exception {
    // e.printStackTrace();
    exchange.setStatusCode(400);
  }
}

final class Router {
  public static final HttpHandler routes() {
    final HttpHandler routing = new RoutingHandler()
      .post("/stream", Handlers::stream)
      .post("/", Handlers::url);
    return new BlockingHandler(routing);
  }
}

final class Worker {
  
  private static final ObjectMapper mapper = new ObjectMapper();
  private static final Tika tika = new Tika();

  public static final String readStream(final InputStream stream) throws Exception {
    final Metadata meta = new Metadata();
    final String text = tika.parseToString(stream, meta).replaceAll("\\s+", " ");
    final Result result = Cld2.detect(text);
    final LanguageInfo info = new LanguageInfo(text, result, toMap(meta));
    return toJson(info);
  }

  private static final Map<String, Object> toMap(final Metadata meta) {
    try {
      final Map<String, Object> map = new HashMap<String, Object>();
      final String[] keys = meta.names();
      Arrays.stream(keys).forEach(key -> map.put(key, meta.get(key)));
      return map;
    } catch(final Exception e) {
      e.printStackTrace();
      return new HashMap<String, Object>();
    }
  }
  
  private static final String toJson(final Object object) {
    try {
      return mapper.writeValueAsString(object);
    } catch(final Exception e) {
      return "{}";
    }
  }
}

final class LanguageService {
  private static final String host = System.getenv().getOrDefault("LS_HOST", "0.0.0.0");
  private static final int port = toInt(System.getenv().get("LS_PORT"), 5656);
  public static void main(String[] args) {
    try {
      Undertow
        .builder()
        .addHttpListener(port, host)
        .setHandler(Router.routes())
        .build()
        .start();
      System.out.println("Language service running on: " + host + ":" + port);
    } catch (final Exception e) {
      e.printStackTrace();
      System.exit(1);
    }
  }
  
  private static final int toInt(final String string, final int defaultValue) {
    try {
      return Integer.parseInt(string);
    }
    catch (final Exception e) {
      return defaultValue;
    }
  }
}
