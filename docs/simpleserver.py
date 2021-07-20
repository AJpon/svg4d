from http.server import HTTPServer, SimpleHTTPRequestHandler
import time
import os

hostname = '127.0.0.1'
port = 8080

httpd = HTTPServer((hostname, port), SimpleHTTPRequestHandler)
print(time.asctime(), "Server Starts - %s:%s" % (hostname, port))

try:
    httpd.serve_forever()
except KeyboardInterrupt:
    pass

httpd.server_close()
print(time.asctime(), "Server Stops - %s:%s" % (hostname, port))