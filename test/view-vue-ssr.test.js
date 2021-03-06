'use strict';
const assert = require('assert');
const request = require('supertest');
const mm = require('egg-mock');

describe('test/view-vue-ssr.test.js', () => {

  describe('default view engine', () => {
    let app;
    before(() => {
      app = mm.app({
        baseDir: 'apps/view-vue-ssr-test',
      });
      return app.ready();
    });

    after(() => app.close());
    afterEach(mm.restore);

    it('should GET /', () => {
      return request(app.callback())
        .get('/')
        .expect('hi, vue ssr')
        .expect(200);
    });

    it('should GET /renderString', () => {
      return request(app.callback())
        .get('/renderString')
        .expect('<div data-server-rendered="true">name:egg-vue-view,desc:egg view plugin for vue</div>')
        .expect(200);
    });

    it('should GET /render', () => {
      return request(app.callback())
        .get('/render')
        .expect(200)
        .expect(res => {
          assert(res.text.indexOf('"csrf"') > -1);
          assert(res.text.indexOf('data-server-rendered="true"') > -1);
          assert(res.text.indexOf('</body></html>') > -1);
          assert(res.text.indexOf('<title>app_locals_render_ssr</title>') > -1);
          assert(res.text.indexOf('vue server side render!') > -1);
          assert(res.text.indexOf('/public/css/test/test.css') > -1);
          assert(res.text.indexOf('/public/js/vendor.js"') > -1);
          assert(res.text.indexOf('/public/js/test/test.js"') > -1);
        });
    });

    it('should GET /renderToHtml', () => {
      return request(app.callback())
        .get('/renderToHtml')
        .expect(200)
        .expect(res => {
          assert(res.text.indexOf('"csrf"') > -1);
          assert(res.text.indexOf('data-server-rendered="true"') > -1);
          assert(res.text.indexOf('</body></html>') > -1);
          assert(res.text.indexOf('<title>app_locals_render_ssr</title>') > -1);
          assert(res.text.indexOf('vue server side render!') > -1);
          assert(res.text.indexOf('/public/css/test/test.css') > -1);
          assert(res.text.indexOf('/public/js/vendor.js"') > -1);
          assert(res.text.indexOf('/public/js/test/test.js"') > -1);
        });
    });

    it('should GET /renderClient', () => {
      return request(app.callback())
        .get('/renderClient')
        .expect(200)
        .expect(res => {
          assert(res.text.indexOf('"csrf"') > -1);
          assert(res.text.indexOf('data-server-rendered="true"') > -1);
          assert(res.text.indexOf('name="client"') > -1);
          assert(res.text.indexOf('vue server side render!') > -1);
          assert(res.text.indexOf('/public/css/test/test.css') > -1);
          assert(res.text.indexOf('/public/js/vendor.js"') > -1);
          assert(res.text.indexOf('/public/js/test/test.js"') > -1);
        });
    });

    it('should GET /renderAsset', () => {
      return request(app.callback())
        .get('/renderAsset')
        .expect(200)
        .expect(res => {
          assert(res.text.indexOf('<title>renderAsset</title>') > -1);
          assert(res.text.indexOf('/public/js/runtime.js') > -1);
          assert(res.text.indexOf('/public/js/vendor.js"') > -1);
          assert(res.text.indexOf('/public/js/app/app.js"') > -1);
        });
    });

    it('should GET /renderVueAsset', () => {
      return request(app.callback())
        .get('/renderVueAsset')
        .expect(200)
        .expect(res => {
          assert(res.text.indexOf('<title>renderAsset</title>') > -1);
          assert(res.text.indexOf('/public/js/runtime.js') > -1);
          assert(res.text.indexOf('/public/js/vendor.js"') > -1);
          assert(res.text.indexOf('/public/js/app/app.js"') > -1);
        });
    });

    it('should GET /renderVueClient', () => {
      return request(app.callback())
        .get('/renderVueClient')
        .expect(200)
        .expect(res => {
          assert(res.text.indexOf('"csrf"') > -1);
          assert(res.text.indexOf('data-server-rendered="true"') > -1);
          assert(res.text.indexOf('name="client"') > -1);
          assert(res.text.indexOf('vue server side render!') > -1);
          assert(res.text.indexOf('/public/css/test/test.css') > -1);
          assert(res.text.indexOf('/public/js/vendor.js"') > -1);
          assert(res.text.indexOf('/public/js/test/test.js"') > -1);
        });
    });

    it('should GET /render server error, client render', () => {
      return request(app.callback())
        .get('/renderServerError')
        .expect(200)
        .expect(res => {
          assert(res.text.match(new RegExp('<meta name="keywords" content="ssr">', 'g')));
          assert(res.text.match(new RegExp('<meta name="description" content="vue server render error, client render">', 'g')));
          assert(res.text.indexOf('vue server render error, client render') > -1);
          assert(res.text.indexOf('/public/css/error/error.css') > -1);
          assert(res.text.indexOf('/public/js/vendor.js"') > -1);
          assert(res.text.indexOf('/public/js/error/error.js"') > -1);
        });
    });

    it('should GET /render server error, don\'t fallback', () => {
      mm(app.config.vuessr, 'fallbackToClient', false);

      return request(app.callback())
        .get('/renderServerError')
        .expect(500);
    });

    it('should not throw error without manifest.json', () => {
      const app = mm.app({
        baseDir: 'apps/view-vue-ssr-test2',
      });

      return app.ready()
        .then(() => request(app.callback())
          .get('/renderClient')
          .expect(200));
    });
  });

  describe('locals and crsf test', () => {
    let app;
    before(() => {
      mm.env('test');
      app = mm.app({
        baseDir: 'apps/view-vue-ssr-test',
      });
      return app.ready();
    });

    after(() => app.close());
    afterEach(mm.restore);

    it('should GET /renderLocals', () => {
      return request(app.callback())
        .get('/renderLocals')
        .expect(200)
        .expect(res => {
          assert(res.text.indexOf('"csrf"') === -1);
          assert(res.text.indexOf('<title>app_locals_render_ssr</title>') === -1);
          assert(res.text.indexOf('data-server-rendered="true"') > -1);
        });
    });
  });

  describe('vue server render no manifest test', () => {
    let app;
    before(() => {
      app = mm.app({
        baseDir: 'apps/view-vue-ssr-test2',
      });
      return app.ready();
    });

    after(() => app.close());
    afterEach(mm.restore);

    it('should GET /render', () => {
      return request(app.callback())
        .get('/render')
        .expect(200)
        .expect(res => {
          assert(res.text.indexOf('data-server-rendered="true"') > -1);
          assert(res.text.indexOf('</body></html>') > -1);
          assert(res.text.indexOf('<title>app_locals_render_ssr</title>') > -1);
          assert(res.text.indexOf('vue server side render!') > -1);
        });
    });

    it('should GET /renderClient', () => {
      return request(app.callback())
        .get('/renderClient')
        .expect(200)
        .expect(res => {
          assert(res.text.indexOf('data-server-rendered="true"') > -1);
          assert(res.text.indexOf('name="client"') > -1);
        });
    });
  });
});
