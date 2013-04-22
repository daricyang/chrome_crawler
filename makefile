
help :
	@echo "please specific a task : [M2CCrawler | server]"

EMPTY := 
SPACE := $(EMPTY) $(EMPTY)

SHARE_SRCS = $(SPACE)http_agent.js worker.js fetcher.js tools.js
SHARE_SRCS_PATH = $(subst $(SPACE), src/server/,$(SHARE_SRCS))

M2CCrawler : src/M2CCrawler/* $(SHARE_SRCS_PATH)
	mkdir -p M2CCrawler
	-cp $? M2CCrawler/


	
SERVER_SRCS := $(SPACE)http_agent.js batch_operator.js crawler.js fetcher.js slave.js tools.js chromeServer.js delay_operator.js handlers.js server.js worker.js
SERVER_SRCS_PATH = $(subst $(SPACE), src/server/,$(SERVER_SRCS))

server : bin/package.json server_srcs 
	
server_srcs : $(SERVER_SRCS_PATH)
	mkdir -p bin
	cp $? bin/	

bin/package.json : src/server/package.json
	mkdir -p bin
	cp $? bin/
	cd bin && npm install -l
	
clean :
	-rm -rf bin M2CCrawler
