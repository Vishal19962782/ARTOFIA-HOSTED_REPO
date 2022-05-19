const express = require("express");
const router = express.Router();
const { verify } = require("../route/jwt-middleware/verify");
const User = require("../models/usermodel");
const Post = require("../models/post");
const Ticket = require("../models/TicketOrder");
const Orders = require("../models/orders");
const Events = require("../models/Events");
const { where } = require("../models/usermodel");
const mongoose = require("mongoose");
// ----------------------------EXPORTS--------------------------------------//
router.get("/", verify, async (req, res) => {
  const userId = mongoose.Types.ObjectId(req.headers.user);
  const posts = await Post.aggregate([
    {
      $match: { postOwner: { $eq: userId } },
    },
    {
      $group: { _id: null, values: { $push: "$_id" } },
    },
    {
      $project: { _id: 0, values: 1 },
    },
  ]);
  console.log(req.headers.user, posts);
  const event=await Events.find({eventOwner:userId})
  const events = await Events.aggregate([
    {
      $match: { eventOwner: { $eq: userId } },
    },
    {
      $group: { _id: null, values: { $push: "$_id" } },
    },
    {
      $project: { _id: 0, values: 1 },
    },
  ]);
  console.log("EVENTSS",events[0].values);
  let postRevenue = await Orders.aggregate([
    { $match: { orderItem: { $in: posts[0].values } } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  console.log(postRevenue);
  let eventRevenue =  await Ticket.aggregate([
    { $match: { orderItem: { $in: events[0].values } } },
    { $group: { _id: null, total: { $sum: "$amount" }, count: { $sum: 1 } } },
  ]);
  console.log("EVENT REVENUE",eventRevenue);
  res.json({ events,event, posts, postRevenue, eventRevenue });
}); 

module.exports = router;
