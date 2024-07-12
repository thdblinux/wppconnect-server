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
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import aws from 'aws-sdk';
import api from 'axios';
import Crypto from 'crypto';
import fs from 'fs';
import mimetypes from 'mime-types';
import os from 'os';
import path from 'path';
import { promisify } from 'util';

import config from '../config';
import { convert } from '../mapper/index';
import { ServerOptions } from '../types/ServerOptions';

let mime: any, crypto: any; //, aws: any;
if (config.webhook.uploadS3) {
  mime = config.webhook.uploadS3 ? mimetypes : null;
  crypto = config.webhook.uploadS3 ? Crypto : null;
}

export function contactToArray(number: any, isGroup?: boolean) {
  const localArr: any = [];
  if (Array.isArray(number)) {
    for (let contact of number) {
      isGroup
        ? (contact = contact.split('@')[0])
        : (contact = contact.split('@')[0]?.replace(/[^\w ]/g, ''));
      if (contact !== '')
        if (isGroup) (localArr as any).push(`${contact}@g.us`);
        else (localArr as any).push(`${contact}@c.us`);
    }
  } else {
    const arrContacts = number.split(/\s*[,;]\s*/g);
    for (let contact of arrContacts) {
      isGroup
        ? (contact = contact.split('@')[0])
        : (contact = contact.split('@')[0]?.replace(/[^\w ]/g, ''));
      if (contact !== '')
        if (isGroup) (localArr as any).push(`${contact}@g.us`);
        else (localArr as any).push(`${contact}@c.us`);
    }
  }

  return localArr;
}

export function groupToArray(group: any) {
  const localArr: any = [];
  if (Array.isArray(group)) {
    for (let contact of group) {
      contact = contact.split('@')[0];
      if (contact !== '') (localArr as any).push(`${contact}@g.us`);
    }
  } else {
    const arrContacts = group.split(/\s*[,;]\s*/g);
    for (let contact of arrContacts) {
      contact = contact.split('@')[0];
      if (contact !== '') (localArr as any).push(`${contact}@g.us`);
    }
  }

  return localArr;
}

export function groupNameToArray(group: any) {
  const localArr: any = [];
  if (Array.isArray(group)) {
    for (const contact of group) {
      if (contact !== '') (localArr as any).push(`${contact}`);
    }
  } else {
    const arrContacts = group.split(/\s*[,;]\s*/g);
    for (const contact of arrContacts) {
      if (contact !== '') (localArr as any).push(`${contact}`);
    }
  }

  return localArr;
}

export async function callWebHook(
  client: any,
  req: any,
  event: any,
  data: any
) {
  const webhook =
    client?.config.webhook || req.serverOptions.webhook.url || false;
  if (webhook) {
    if (req.serverOptions.webhook.autoDownload)
      await autoDownload(client, req, data);
    try {
      const chatId =
        data.from ||
        data.chatId ||
        (data.chatId ? data.chatId._serialized : null);
      data = Object.assign({ event: event, session: client.session }, data);
      if (req.serverOptions.mapper.enable)
        data = await convert(req.serverOptions.mapper.prefix, data);
      api
        .post(webhook, data)
        .then(() => {
          try {
            const events = ['unreadmessages', 'onmessage'];
            if (events.includes(event) && req.serverOptions.webhook.readMessage)
              client.sendSeen(chatId);
          } catch (e) {}
        })
        .catch((e) => {
          req.logger.warn('Error calling Webhook.', e);
        });
    } catch (e) {
      req.logger.error(e);
    }
  }
}

async function autoDownload(client: any, req: any, message: any) {
  try {
    if (message && (message['mimetype'] || message.isMedia || message.isMMS)) {
      const buffer = await client.decryptFile(message);
      if (req.serverOptions.webhook.uploadS3) {
        const hashName = crypto.randomBytes(24).toString('hex');

        const s3 = new aws.S3();
        const bucketName =
          config.webhook.awsBucketName && config.webhook.awsBucketName !== ''
            ? config.webhook.awsBucketName
            : client.session;
        const fileName = `${
          config.webhook.awsBucketName && config.webhook.awsBucketName !== ''
            ? client.session + '/'
            : ''
        }${hashName}.${mime.extension(message.mimetype)}`;

        const params = {
          Bucket: bucketName,
          Key: fileName,
          Body: buffer,
          ACL: 'public-read',
          ContentType: message.mimetype,
        };
        const data = await s3.upload(params).promise();
        message.fileUrl = data.Location;
      } else {
        message.body = await buffer.toString('base64');
      }
    }
  } catch (e) {
    req.logger.error(e);
  }
}

export async function startAllSessions(config: any, logger: any) {
  try {
    await api.post(
      `${config.host}:${config.port}/api/${config.secretKey}/start-all`
    );
  } catch (e) {
    logger.error(e);
  }
}

export async function startHelper(client: any, req: any) {
  if (req.serverOptions.webhook.allUnreadOnStart) await sendUnread(client, req);

  if (req.serverOptions.archive.enable) await archive(client, req);
}

async function sendUnread(client: any, req: any) {
  req.logger.info(`${client.session} : Inicio enviar mensagens não lidas`);

  try {
    const chats = await client.getAllChatsWithMessages(true);

    if (chats && chats.length > 0) {
      for (let i = 0; i < chats.length; i++)
        for (let j = 0; j < chats[i].msgs.length; j++) {
          callWebHook(client, req, 'unreadmessages', chats[i].msgs[j]);
        }
    }

    req.logger.info(`${client.session} : Fim enviar mensagens não lidas`);
  } catch (ex) {
    req.logger.error(ex);
  }
}

async function archive(client: any, req: any) {
  async function sleep(time: number) {
    return new Promise((resolve) => setTimeout(resolve, time * 10));
  }

  req.logger.info(`${client.session} : Inicio arquivando chats`);

  try {
    let chats = await client.getAllChats();
    if (chats && Array.isArray(chats) && chats.length > 0) {
      chats = chats.filter((c) => !c.archive);
    }
    if (chats && Array.isArray(chats) && chats.length > 0) {
      for (let i = 0; i < chats.length; i++) {
        const date = new Date(chats[i].t * 1000);

        if (DaysBetween(date) > req.serverOptions.archive.daysToArchive) {
          await client.archiveChat(
            chats[i].id.id || chats[i].id._serialized,
            true
          );
          await sleep(
            Math.floor(Math.random() * req.serverOptions.archive.waitTime + 1)
          );
        }
      }
    }
    req.logger.info(`${client.session} : Fim arquivando chats`);
  } catch (ex) {
    req.logger.error(ex);
  }
}

function DaysBetween(StartDate: Date) {
  const endDate = new Date();
  // The number of milliseconds in all UTC days (no DST)
  const oneDay = 1000 * 60 * 60 * 24;

  // A day in UTC always lasts 24 hours (unlike in other time formats)
  const start = Date.UTC(
    endDate.getFullYear(),
    endDate.getMonth(),
    endDate.getDate()
  );
  const end = Date.UTC(
    StartDate.getFullYear(),
    StartDate.getMonth(),
    StartDate.getDate()
  );

  // so it's safe to divide by 24 hours
  return (start - end) / oneDay;
}

export function createFolders() {
  const __dirname = path.resolve(path.dirname(''));
  const dirFiles = path.resolve(__dirname, 'WhatsAppImages');
  if (!fs.existsSync(dirFiles)) {
    fs.mkdirSync(dirFiles);
  }

  const dirUpload = path.resolve(__dirname, 'uploads');
  if (!fs.existsSync(dirUpload)) {
    fs.mkdirSync(dirUpload);
  }
}

export function strToBool(s: string) {
  return /^(true|1)$/i.test(s);
}

export function getIPAddress() {
  const interfaces = os.networkInterfaces();
  for (const devName in interfaces) {
    const iface: any = interfaces[devName];
    for (let i = 0; i < iface.length; i++) {
      const alias = iface[i];
      if (
        alias.family === 'IPv4' &&
        alias.address !== '127.0.0.1' &&
        !alias.internal
      )
        return alias.address;
    }
  }
  return '0.0.0.0';
}

export function setMaxListners(serverOptions: ServerOptions) {
  if (serverOptions && Number.isInteger(serverOptions.maxListeners)) {
    process.setMaxListeners(serverOptions.maxListeners);
  }
}

export const unlinkAsync = promisify(fs.unlink);

export function createCatalogLink(session: any) {
  const [wid] = session.split('@');
  return `https://wa.me/c/${wid}`;
}
