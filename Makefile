TESTS = test/*.test.js 

test:
	@NODE_ENV=test ./node_modules/.bin/mocha \
	$(TESTS)

install:
	@npm install --registry=http://r.cnpmjs.org


.PHONY: test