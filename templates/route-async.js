'use strict';

/**
 * @export {Object}
 */
module.exports = {
  //middleware: [],
  //resource: ['index'],

  /**
   * @openapi
   *
   * {{routePath}}:
   *   get:
   *     description: Route description.
   *     responses:
   *       200:
   *         description: OK
   *         content:
   *           text/html:
   *             schema:
   *               type: string
   */
  async index (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('OK');
  }
};
