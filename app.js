const Koa = require("koa");
const router = require("koa-router")();
const serve = require("koa-static");
const path = require("path");
const fs = require("fs");
const app = (module.exports = new Koa());

app.use(serve(path.join(__dirname, "/")));

router.get("/indexes", async ctx => {
  ctx.response.body = await fs.readFileSync("./indexes.html", "utf-8");
  // router.url("/indexes.html");
});

router.get('/home', async ctx => {
  ctx.response.body = await fs.readFileSync('./home/home.html', 'utf-8');
})

app.use(router.routes());
if (!module.parent) {
  app.listen(8888);
}
