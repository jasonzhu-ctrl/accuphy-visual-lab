// Lets plain Node import the lake's modules, which use Vite-style extensionless imports ('./terrain').
// Usage: node --import ./scripts/dev/node-register.mjs scripts/dev/<script>.mjs
export async function resolve(spec, ctx, next) {
  try { return await next(spec, ctx) } catch (e) {
    if (spec.startsWith('.') && !/\.\w+$/.test(spec)) { try { return await next(spec + '.js', ctx) } catch { return next(spec + '.jsx', ctx) } }
    throw e
  }
}
