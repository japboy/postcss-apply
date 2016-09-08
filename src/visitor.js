import balanced from 'balanced-match';

const RE_PROP_SET = /^(--)([\w-]+)(\s*)([:;]?)$/;


export default class Visitor {

  cache = {};
  result = {};

  collect(rule) {
    const matches = RE_PROP_SET.exec(rule.selector);
    const parent = rule.parent;

    if (!matches) {
      return;
    }

    if (parent.selector !== ':root') {
      rule.warn(
        this.result,
        'Custom properties sets are only allowed on `:root` rules.'
      );

      return;
    }

    this.cache[matches[2]] = rule;
    rule.remove();

    if (!parent.nodes.length) {
      parent.remove();
    }
  }

  replace(atRule) {
    const param = getParamValue(atRule.params);
    const matches = RE_PROP_SET.exec(param);

    if (!matches) {
      return;
    }

    const setName = matches[2];

    if (setName in this.cache) {
      atRule.replaceWith(this.cache[setName].nodes);
    } else {
      atRule.warn(
        this.result,
        `No custom properties set declared for \`${setName}\`.`
      );
    }
  }
}


/**
 * Helper: allow parens usage in `@apply` rule declaration.
 * This is for Polymer integration.
 * @param {String} param
 * @return {String}
 */
function getParamValue(param) {
  return /^\(/.test(param) ? balanced('(', ')', param).body : param;
}
