import express from 'express';
import databaseService from "./database.service";


const Router = express.Router();

Router.get('/getVerifyMessage', async (req, res) => {
  const address = req.query.address as string;
  const message = await databaseService.getVerifyMessage(address);
  res.json({ message });
});

Router.get('/getRoleBySessionId', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const address = await databaseService.getAddressBySessionId(sessionId);
  const role = await databaseService.getUserRole(address);
  res.json({ role });
});

Router.get('/getAddressBySessionId', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const address = await databaseService.getAddressBySessionId(sessionId);
  res.json({ address });
});

Router.get('/getSessionExpireAt', async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const isValid = await databaseService.getISSessionExpired(sessionId);
  res.json({ isValid });
});

Router.post('/updateUser', async (req, res) => {
  const { address, role } = req.body;
  const result = await databaseService.updateUser(address, role);
  res.json(result);
});

Router.post('/uploadFile', async (req, res) => {
  const { address } = req.body;
  const file = req.file;
  if (!file) {
    return res.status(400).json({ success: false, message: "No file uploaded" });
  }
  const result = await databaseService.uploadFile(address, file);
  res.json(result);
});

Router.post('/updateMerchant', async (req, res) => {
  const { merchantAddress, merchantName, walletAddress, isVerified } = req.body;
  const result = await databaseService.updateMerchant(merchantAddress, merchantName, walletAddress, isVerified);
  res.json(result);
});

Router.post('/updateVerifyMessage', async (req, res) => {
  const { address, message, sessionId, expireAt } = req.body;
  const result = await databaseService.updateVerifyMessage(address, message, sessionId, expireAt);
  res.json(result);
});

export default Router;