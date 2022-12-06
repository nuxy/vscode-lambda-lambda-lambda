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
   *     description: Example using `Route.index` handler alias.
   *     responses:
   *       200:
   *         description: Returns generic response.
   *         content:
   *           text/html:
   *             schema:
   *               type: string
   */
  index (req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('Lambda, Lambda, Lambda');
  }
};
