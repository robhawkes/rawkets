.PHONY: docs

run:
	node ./index.js

test:
	@./node_modules/.bin/mocha

docs:
	rm -rf ./docs
	docco --output ./docs/server ./server/lib/*.js
	docco --output ./docs/public ./public/js/rawkets/*.js