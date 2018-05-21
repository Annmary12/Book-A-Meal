import { order as orders, meal as meals } from '../models';
import deepFlatten from '../helpers/deepFlatten';


/**
 * @exports
 * @class OrderController
 */
class OrderController {
  /**
   * Creates a new order
   *
   * @staticmethod
   * @param  {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Middleware next
   * @return {json} res.json
   */
  static createOrder(req, res, next) {
    const {
      mealId,
      quantity,
      deliveryAddress,
      phoneNumber
    } = req.body;

    return meals.findOne({
      where: {
        id: mealId
      }
    })
      .then((foundMeal) => {
        if (foundMeal) {
          return orders.create({
            userId: req.user.id,
            mealId,
            quantity,
            deliveryAddress,
            phoneNumber,
            status: 'pending'
          });
        }
        res.status(404).json({
          status: 'error',
          message: 'Meal does not exist'
        });
      })
      .then((createdOrder) => {
        if (createdOrder) {
          return createdOrder.reload();
        }
      })
      .then((createdOrder) => {
        if (createdOrder) {
          res.status(201).json({
            status: 'success',
            message: 'Order created successfully',
            order: createdOrder
          });
        }
      })
      .catch(err => next(err));
  }
  /**
   * Gets orders for a caterer
   *
   * @param  {object} req - Request object
   * @return {Promise} orders - Promise resolving with caterers orders
   */
  static getCaterersOrders(req) {
    return meals.findAll({
      where: {
        userId: req.user.id
      }
    })
      .then((caterersMeals) => {
        const foundOrders = caterersMeals.map(currentMeal => currentMeal.getOrders()
          .then((mealOrders) => {
            if (foundOrders.length > 0) {
              return mealOrders;
            }
          }));

        return Promise.all(orders);
      })
      .then((foundOrders) => {
        const filteredOrders = foundOrders.filter(foundOrder => foundOrder);

        return deepFlatten(filteredOrders);
      });
  }
  /**
   * Gets all orders
   *
   * @staticmethod
   * @param  {object} req - Request object
   * @param {object} res - Response object
   * @param {function} next - Middlware next
   * @return {json} res.json
   */
  static getAllOrders(req, res, next) {
    if (req.user.role === 'caterer') {
      return OrderController.getCaterersOrders(req)
        .then((caterersOrders) => {
          res.status(200).json({
            status: 'success',
            orders: caterersOrders
          });
        })
        .catch(err => next(err));
    }
    return orders.findAll({
      where: {
        userId: req.user.id
      }
    })
      .then(customersOrders => res.status(200).json({
        status: 'success',
        orders: customersOrders
      }))
      .catch(err => next(err));
  }

  /**
   * Updates an existing order
   *
   * @staticmethod
   *
   * @param  {object} req - Request object
   * @param {object} res - Response object
   * @param {Function} next - Middleware next
   * @return {json} res.json
   */
  static updateOrder(req, res, next) {
    const {
      mealId,
      quantity,
      deliveryAddress,
      phoneNumber
    } = req.body;

    const { order } = req;
    return order.updateAttributes({
      mealId: mealId || order.mealId,
      quantity: quantity || order.quantity,
      deliveryAddress: deliveryAddress || order.deliveryAddress,
      phoneNumber: phoneNumber || order.phoneNumber
    })
      .then((updatedOrder) => {
        res.status(200).json({
          status: 'success',
          message: 'order updated successfully',
          order: updatedOrder
        });
      })
      .catch(err => next(err));
  }

  /**
   * Mark an order as delivered order
   *
   * @staticmethod
   *
   * @param  {object} req - Request object
   * @param {object} res - Response object
   * @param {Function} next - Middleware next
   * @return {json} res.json
   */
  static deliverOrder(req, res, next) {
    const { orderId } = req.params;

    return OrderController.getCaterersOrders(req)
      .then(mealOrders => mealOrders.find(order => order.id === orderId))
      .then((order) => {
        if (order) {
          return order.updateAttributes({
            status: 'delivered'
          });
        }
      })
      .then((updatedOrder) => {
        if (updatedOrder) {
          return res.status(200).json({
            status: 'success',
            message: 'Order delivered successfully',
            order: updatedOrder
          });
        }

        res.status(404).json({
          status: 'error',
          message: 'order not found'
        });
      })
      .catch(err => next(err));
  }
}

export default OrderController;
