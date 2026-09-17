.PHONY: install dev build preview test clean

install:
	npm install

dev: install
	npm run dev -- --host 127.0.0.1 --port 5173

build: install
	npm run build

test: install
	npm test

preview: build
	npm run preview -- --host 127.0.0.1 --port 5173

clean:
	rm -rf node_modules dist
