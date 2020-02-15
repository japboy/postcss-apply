import { plugin } from 'postcss';
import Visitor from './visitor';
import { name } from '../package.json';

export default plugin(name, options => async (css, result) => {
  const visitor = new Visitor(options);
  visitor.result = result;

  visitor.prepend();

  await visitor.importFrom();

  css.walkRules(visitor.collect);

  visitor.resolveNested();

  css.walkAtRules('apply', visitor.resolve);
});
