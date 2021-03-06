const express = require('express');

const router = express.Router();
const { checkIfLoggedIn } = require('../middlewares');
const { isAdmin } = require('../middlewares');

const Space = require('../models/Space');
const User = require('../models/User');

router.post('/new', isAdmin, async (req, res) => {
	const { spaceName, spaceType, imgUrl, daily, weekly, monthly, city } = req.body;

	try {
		const newSpace = await Space.create({
			spaceName,
			spaceType,
			imgUrl,
			daily,
			weekly,
			monthly,
			city,
		});
		res.status(200).json(newSpace);
	} catch (err) {
		res.json(err);
	}
});

router.get('/all', checkIfLoggedIn, async (req, res) => {
	try {
		const space = await Space.find();
		res.json(space);
	} catch (err) {
		res.json(err);
	}
});

router.get('/:id/details', checkIfLoggedIn, async (req, res) => {
	try {
		const dbSpace = await Space.findById(req.params.id);
		res.status(200).json(dbSpace);
	} catch (err) {
		res.json(err);
	}
});

router.post('/:id/details', checkIfLoggedIn, async (req, res) => {
	const { _id } = req.session.currentUser;
	const { id } = req.params;
	try {
		const dbUser = await User.findById(_id);
		if (dbUser.favSpaces.includes(id)) {
			res.status(401).json('This space is already on the list');
		} else {
			dbUser.favSpaces.push(id);
			dbUser.save();
			req.session.currentUser = dbUser;
			res.json({ favSpaces: id });
		}
	} catch (err) {
		res.json(err);
	}
});

router.put('/:id/edit', isAdmin, async (req, res) => {
	const { id } = req.params;
	const { spaceName, spaceType, imgUrl, daily, weekly, monthly, city } = req.body;
	try {
		const updateSpace = await Space.findByIdAndUpdate(id, {
			spaceName,
			spaceType,
			imgUrl,
			daily,
			weekly,
			monthly,
			city,
		});
		res.json({
			updateSpace,
		});
	} catch (err) {
		res.json(err);
	}
});

router.put('/favourites/:id', checkIfLoggedIn, async (req, res) => {
	const { _id } = req.session.currentUser;
	const { id } = req.params;
	try {
		const dbUser = await User.findById(_id);
		const list = dbUser.favSpaces.indexOf(id);
		dbUser.favSpaces.splice(list, 1);
		dbUser.save();
		req.session.currentUser = dbUser;
		res.json({ notFavSpace: id });
	} catch (error) {
		res.json(error);
	}
});

router.delete('/:id/delete', isAdmin, async (req, res) => {
	const { id } = req.params;
	try {
		await Space.findByIdAndRemove(id, req.body);
		res.status(200).json({
			message: `Space with ${req.params.id} is removed successfully.`,
		});
	} catch (err) {
		res.json(err);
	}
});

module.exports = router;
