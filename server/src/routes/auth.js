const express = require('express');
const bcrypt = require('bcryptjs');
const { User } = require('../models');
const { getSettings } = require('../db');
const { logActivity } = require('../billing');
const { clean, isEmail, hallNowLabel } = require('../time');
const { taka } = require('../money');

const router = express.Router();

function asyncRoute(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}

function presentUser(user) {
  if (!user) return null;
  const paisa = user.balancePaisa || 0;
  return {
    id: String(user._id),
    fullName: user.fullName,
    email: user.email,
    role: user.role,
    studentCode: user.studentCode || '',
    roomNo: user.roomNo || '',
    phone: user.phone || '',
    status: user.status,
    balance: paisa / 100,
    balanceLabel: taka(paisa / 100)
  };
}

async function sessionPayload(req) {
  const settings = await getSettings();
  let pendingSignups = 0;
  if (req.user && req.user.role === 'admin') {
    pendingSignups = await User.countDocuments({ status: 'pending' });
  }
  return {
    user: presentUser(req.user),
    hallName: settings.hallName,
    hallNow: hallNowLabel(),
    pendingSignups
  };
}

router.get('/me', asyncRoute(async (req, res) => {
  res.json(await sessionPayload(req));
}));

router.post('/login', asyncRoute(async (req, res) => {
  const email = clean(req.body.email, 160).toLowerCase();
  const password = String(req.body.password || '');
  const user = await User.findOne({ email });
  const matches = user ? await bcrypt.compare(password, user.passwordHash) : false;
  if (!user || !matches) {
    return res.status(401).json({ message: 'Those details do not match an active account.' });
  }
  if (user.status === 'pending') {
    return res.status(403).json({ message: 'This account is waiting for the hall office to approve it.' });
  }
  if (user.status !== 'active') {
    return res.status(403).json({ message: 'This account is inactive. Ask the hall office to turn it back on.' });
  }
  req.session.userId = String(user._id);
  await logActivity(user._id, 'Signed in', user.role);
  req.user = user;
  res.json(await sessionPayload(req));
}));

router.post('/logout', (req, res) => {
  const finish = () => {
    res.clearCookie('hallmeal.sid', { path: '/' });
    res.json({ ok: true });
  };
  if (!req.session) return finish();
  req.session.destroy(finish);
});

router.post('/signup', asyncRoute(async (req, res) => {
  const form = {
    fullName: clean(req.body.fullName, 120),
    email: clean(req.body.email, 160).toLowerCase(),
    studentCode: clean(req.body.studentCode, 40),
    roomNo: clean(req.body.roomNo, 40),
    phone: clean(req.body.phone, 30)
  };
  const password = String(req.body.password || '');
  const confirm = String(req.body.confirm || '');
  if (form.fullName.length < 2) return res.status(400).json({ message: 'Enter your full name.' });
  if (!isEmail(form.email)) return res.status(400).json({ message: 'Enter a valid email.' });
  if (form.studentCode.length < 2) return res.status(400).json({ message: 'Enter your student ID.' });
  if (password.length < 6) return res.status(400).json({ message: 'Choose a password of at least 6 characters.' });
  if (password !== confirm) return res.status(400).json({ message: 'The two passwords do not match.' });
  if (await User.exists({ email: form.email })) {
    return res.status(400).json({ message: 'That email is already on the hall record.' });
  }
  if (await User.exists({ studentCode: form.studentCode })) {
    return res.status(400).json({ message: 'That student ID is already on the hall record.' });
  }
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await User.create({ ...form, passwordHash, role: 'student', status: 'pending' });
  await logActivity(user._id, 'Requested an account', form.email);
  res.status(201).json({
    message: 'Request received. You can sign in after the hall office approves the account.'
  });
}));

module.exports = router;
module.exports.presentUser = presentUser;
module.exports.asyncRoute = asyncRoute;
