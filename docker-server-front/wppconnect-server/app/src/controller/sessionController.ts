/*
 * Copyright 2021 WPPConnect Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permclearSessionissions and
 * limitations under the License.
 */
import { Message, Whatsapp } from '@wppconnect-team/wppconnect';
import { Request, Response } from 'express';
import fs from 'fs';
import mime from 'mime-types';
import QRCode from 'qrcode';
import { Logger } from 'winston';

import { version } from '../../package.json';
import config from '../config';
import CreateSessionUtil from '../util/createSessionUtil';
import { callWebHook, contactToArray } from '../util/functions';
import getAllTokens from '../util/getAllTokens';
import { clientsArray } from '../util/sessionUtil';

const SessionUtil = new CreateSessionUtil();

async function downloadFileFunction(
  message: Message,
  client: Whatsapp,
  logger: Logger
) {
  try {
    const buffer = await client.decryptFile(message);

    const filename = `./WhatsAppImages/file${message.t}`;
    if (!fs.existsSync(filename)) {
      let result = '';
      if (message.type === 'ptt') {
        result = `${filename}.oga`;
      } else {
        result = `${filename}.${mime.extension(message.mimetype)}`;
      }

      await fs.writeFile(result, buffer, (err) => {
        if (err) {
          logger.error(err);
        }
      });

      return result;
    } else {
      return `${filename}.${mime.extension(message.mimetype)}`;
    }
  } catch (e) {
    logger.error(e);
    logger.warn(
      'Erro ao descriptografar a midia, tentando fazer o download direto...'
    );
    try {
      const buffer = await client.downloadMedia(message);
      const filename = `./WhatsAppImages/file${message.t}`;
      if (!fs.existsSync(filename)) {
        let result = '';
        if (message.type === 'ptt') {
          result = `${filename}.oga`;
        } else {
          result = `${filename}.${mime.extension(message.mimetype)}`;
        }

        await fs.writeFile(result, buffer, (err) => {
          if (err) {
            logger.error(err);
          }
        });

        return result;
      } else {
        return `${filename}.${mime.extension(message.mimetype)}`;
      }
    } catch (e) {
      logger.error(e);
      logger.warn('Não foi possível baixar a mídia...');
    }
  }
}

export async function download(message: any, client: any, logger: any) {
  try {
    const path = await downloadFileFunction(message, client, logger);
    return path?.replace('./', '');
  } catch (e) {
    logger.error(e);
  }
}

export async function startAllSessions(req: Request, res: Response) {
  /**
   * #swagger.tags = ["Auth"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["secretkey"] = {
      schema: 'THISISMYSECURECODE'
     }
   */
  const { secretkey } = req.params;
  const { authorization: token } = req.headers;

  let tokenDecrypt = '';

  if (secretkey === undefined) {
    tokenDecrypt = (token as any).split(' ')[0];
  } else {
    tokenDecrypt = secretkey;
  }

  const allSessions = await getAllTokens(req);

  if (tokenDecrypt !== req.serverOptions.secretKey) {
    return res.status(400).json({
      response: 'error',
      message: 'The token is incorrect',
    });
  }

  allSessions.map(async (session: string) => {
    const util = new CreateSessionUtil();
    await util.opendata(req, session);
  });

  return await res
    .status(201)
    .json({ status: 'success', message: 'Starting all sessions' });
}

export async function showAllSessions(req: Request, res: Response) {
  /**
   * #swagger.tags = ["Auth"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["secretkey"] = {
      schema: ''
     }
   */
  const { secretkey } = req.params;
  const { authorization: token } = req.headers;

  let tokenDecrypt: any = '';

  if (secretkey === undefined) {
    tokenDecrypt = token?.split(' ')[0];
  } else {
    tokenDecrypt = secretkey;
  }

  const arr: any = [];

  if (tokenDecrypt !== req.serverOptions.secretKey) {
    return res.status(400).json({
      response: false,
      message: 'The token is incorrect',
    });
  }

  Object.keys(clientsArray).forEach((item) => {
    arr.push({ session: item });
  });

  return res.status(200).json({ response: arr });
}

export async function startSession(req: Request, res: Response) {
  /**
   * #swagger.tags = ["Auth"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.requestBody = {
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              webhook: { type: "string" },
              waitQrCode: { type: "boolean" },
            }
          },
          example: {
            webhook: "https://webhook.site/7cc2944d-3967-4cea-988c-d57ea80bce5f",
            waitQrCode: false,
          }
        }
      }
     }
   */
  const session = req.session;
  const { waitQrCode = false } = req.body;

  await getSessionState(req, res);
  await SessionUtil.opendata(req, session, waitQrCode ? res : null);
}

export async function closeSession(req: Request, res: Response) {
  /**
   * #swagger.tags = ["Auth"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.requestBody = {
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              clearSession: { type: "boolean" },
            }
          },
          example: {
            clearSession: false,
          }
        }
      }
     }
   */
  const session = req.session;
  const { clearSession = false } = req.body;
  try {
    if ((clientsArray as any)[session].status === null) {
      return await res
        .status(200)
        .json({ status: true, message: 'Session successfully closed' });
    } else {
      (clientsArray as any)[session] = { status: null };

      if (clearSession) {
        const sessionFolder = `${config.customUserDataDir}/${session}`;
        if (fs.existsSync(sessionFolder)) {
          console.log('Deletando pasta: ' + sessionFolder);
          fs.rmdirSync(sessionFolder, { recursive: true });
        }
      }
      await req.client.close();
      req.io.emit('whatsapp-status', false);
      callWebHook(req.client, req, 'closesession', {
        message: `Session: ${session} disconnected`,
        connected: false,
      });

      return await res
        .status(200)
        .json({ status: true, message: 'Session successfully closed' });
    }
  } catch (error) {
    req.logger.error(error);
    return await res
      .status(500)
      .json({ status: false, message: 'Error closing session', error });
  }
}

export async function logOutSession(req: Request, res: Response) {
  /**
   * #swagger.tags = ["Auth"]
   * #swagger.description = 'This route logout and delete session data'
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    const session = req.session;
    await req.client.logout();
    //await req.client.close();
    delete clientsArray[req.session];
    await fs.promises.rm(config.customUserDataDir + req.session, {
      recursive: true,
    });
    await fs.promises.rm(
      __dirname + `../../../tokens/${req.session}.data.json`
    );

    req.io.emit('whatsapp-status', false);
    callWebHook(req.client, req, 'logoutsession', {
      message: `Session: ${session} logged out`,
      connected: false,
    });

    return await res
      .status(200)
      .json({ status: true, message: 'Session successfully closed' });
  } catch (error) {
    req.logger.error(error);
    return await res
      .status(500)
      .json({ status: false, message: 'Error closing session', error });
  }
}

export async function checkConnectionSession(req: Request, res: Response) {
  /**
   * #swagger.tags = ["Auth"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    await req.client.isConnected();

    return res.status(200).json({ status: true, message: 'Connected' });
  } catch (error) {
    return res.status(200).json({ status: false, message: 'Disconnected' });
  }
}

export async function downloadMediaByMessage(req: Request, res: Response) {
  /**
   * #swagger.tags = ["Messages"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.requestBody = {
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              messageId: { type: "string" },
            }
          },
          example: {
            messageId: '<messageId>'
          }
        }
      }
     }
   */
  const client = req.client;
  const { messageId } = req.body;

  let message;

  try {
    if (!messageId.isMedia || !messageId.type) {
      message = await client.getMessageById(messageId);
    } else {
      message = messageId;
    }

    if (!message)
      return res.status(400).json({
        status: 'error',
        message: 'Message not found',
      });

    if (!(message['mimetype'] || message.isMedia || message.isMMS))
      return res.status(400).json({
        status: 'error',
        message: 'Message does not contain media',
      });

    const buffer = await client.decryptFile(message);

    return res
      .status(200)
      .json({ base64: buffer.toString('base64'), mimetype: message.mimetype });
  } catch (e) {
    req.logger.error(e);
    return res.status(400).json({
      status: 'error',
      message: 'Decrypt file error',
      error: e,
    });
  }
}

export async function getMediaByMessage(req: Request, res: Response) {
  /**
   * #swagger.tags = ["Messages"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["session"] = {
      schema: 'messageId'
     }
   */
  const client = req.client;
  const { messageId } = req.params;

  try {
    const message = await client.getMessageById(messageId);

    if (!message)
      return res.status(400).json({
        status: 'error',
        message: 'Message not found',
      });

    if (!(message['mimetype'] || message.isMedia || message.isMMS))
      return res.status(400).json({
        status: 'error',
        message: 'Message does not contain media',
      });

    const buffer = await client.decryptFile(message);

    return res
      .status(200)
      .json({ base64: buffer.toString('base64'), mimetype: message.mimetype });
  } catch (ex) {
    req.logger.error(ex);
    return res.status(500).json({
      status: 'error',
      message: 'The session is not active',
      error: ex,
    });
  }
}

export async function getSessionState(req: Request, res: Response) {
  /**
   * #swagger.tags = ["Auth"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.requestBody = {
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              waitQrCode: { type: "boolean" },
            }
          },
          example: {
            waitQrCode: false
          }
        }
      }
     }
   */
  try {
    const { waitQrCode = false } = req.body;
    const client = req.client;
    const qr =
      client?.urlcode != null && client?.urlcode != ''
        ? await QRCode.toDataURL(client.urlcode)
        : null;

    if ((client == null || client.status == null) && !waitQrCode)
      return res.status(200).json({ status: 'CLOSED', qrcode: null });
    else if (client != null)
      return res.status(200).json({
        status: client.status,
        qrcode: qr,
        urlcode: client.urlcode,
        version: version,
      });
  } catch (ex) {
    req.logger.error(ex);
    return res.status(500).json({
      status: 'error',
      message: 'The session is not active',
      error: ex,
    });
  }
}

export async function getQrCode(req: Request, res: Response) {
  /**
   * #swagger.tags = ["Auth"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    if (req?.client?.urlcode) {
      const qr = req.client.urlcode
        ? await QRCode.toDataURL(req.client.urlcode)
        : null;
      const img = Buffer.from(
        (qr as any).replace(/^data:image\/(png|jpeg|jpg);base64,/, ''),
        'base64'
      );

      res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': img.length,
      });
      res.end(img);
    } else if (typeof req.client === 'undefined') {
      return res.status(200).json({
        status: null,
        message:
          'Session not started. Please, use the /start-session route, for initialization your session',
      });
    } else {
      return res.status(200).json({
        status: req.client.status,
        message: 'QRCode is not available...',
      });
    }
  } catch (ex) {
    req.logger.error(ex);
    return res
      .status(500)
      .json({ status: 'error', message: 'Error retrieving QRCode', error: ex });
  }
}

export async function killServiceWorker(req: Request, res: Response) {
  /**
   * #swagger.ignore=true
   * #swagger.tags = ["Messages"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    return res
      .status(200)
      .json({ status: 'error', response: 'Not implemented yet' });
  } catch (ex) {
    req.logger.error(ex);
    return res.status(500).json({
      status: 'error',
      message: 'The session is not active',
      error: ex,
    });
  }
}

export async function restartService(req: Request, res: Response) {
  /**
   * #swagger.ignore=true
   * #swagger.tags = ["Messages"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
   */
  try {
    return res
      .status(200)
      .json({ status: 'error', response: 'Not implemented yet' });
  } catch (ex) {
    req.logger.error(ex);
    return res.status(500).json({
      status: 'error',
      response: { message: 'The session is not active', error: ex },
    });
  }
}

export async function subscribePresence(req: Request, res: Response) {
  /**
   * #swagger.tags = ["Misc"]
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.requestBody = {
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              phone: { type: "string" },
              isGroup: { type: "boolean" },
              all: { type: "boolean" },
            }
          },
          example: {
            phone: '5521999999999',
            isGroup: false,
            all: false,
          }
        }
      }
     }
   */
  try {
    const { phone, isGroup = false, all = false } = req.body;

    if (all) {
      let contacts;
      if (isGroup) {
        const groups = await req.client.getAllGroups(false);
        contacts = groups.map((p: any) => p.id._serialized);
      } else {
        const chats = await req.client.getAllContacts();
        contacts = chats.map((c: any) => c.id._serialized);
      }
      await req.client.subscribePresence(contacts);
    } else
      for (const contato of contactToArray(phone, isGroup)) {
        await req.client.subscribePresence(contato);
      }

    return await res.status(200).json({
      status: 'success',
      response: { message: 'Subscribe presence executed' },
    });
  } catch (error) {
    return await res.status(500).json({
      status: 'error',
      message: 'Error on subscribe presence',
      error: error,
    });
  }
}

export async function editBusinessProfile(req: Request, res: Response) {
  /**
   * #swagger.tags = ["Profile"]
   * #swagger.description = 'Edit your bussiness profile'
     #swagger.autoBody=false
     #swagger.security = [{
            "bearerAuth": []
     }]
     #swagger.parameters["session"] = {
      schema: 'NERDWHATS_AMERICA'
     }
     #swagger.parameters["obj"] = {
      in: 'body',
      schema: {
        $adress: 'Av. Nossa Senhora de Copacabana, 315',
        $email: 'test@test.com.br',
        $categories: {
          $id: "133436743388217",
          $localized_display_name: "Artes e entretenimento",
          $not_a_biz: false,
        },
        $website: [
          "https://www.wppconnect.io",
          "https://www.teste2.com.br",
        ],
      }
     }
     
     #swagger.requestBody = {
      required: true,
      "@content": {
        "application/json": {
          schema: {
            type: "object",
            properties: {
              adress: { type: "string" },
              email: { type: "string" },
              categories: { type: "object" },
              websites: { type: "array" },
            }
          },
          example: {
            adress: 'Av. Nossa Senhora de Copacabana, 315',
            email: 'test@test.com.br',
            categories: {
              $id: "133436743388217",
              $localized_display_name: "Artes e entretenimento",
              $not_a_biz: false,
            },
            website: [
              "https://www.wppconnect.io",
              "https://www.teste2.com.br",
            ],
          }
        }
      }
     }
   */
  try {
    return res.status(200).json(await req.client.editBusinessProfile(req.body));
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: 'Error on edit business profile',
      error: error,
    });
  }
}
