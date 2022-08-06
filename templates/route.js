'use strict';

/**
 * @export {Object}
 */
module.exports = {
  //middleware: [],
  //resource: ['index'],

  /**
   * GET /{{appUri}}/{{routePath}}
   */
  index (req, res) {
    res.status(200).send();
  }
};
