install:
	npm install

start:
	npm start

lint:
	npx eslint .

build:
	rm -rf dist
	NODE_ENV=production npx webpack

develop:
	npx webpack-dev-server
