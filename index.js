import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
import { parse } from 'node-html-parser'
import { JSONFile } from 'lowdb'
import { Telegraf } from 'telegraf'

dotenv.config()

const BBF = 'https://breakingbadfunny.com'

const db = new JSONFile('db.json')
const bot = new Telegraf(process.env.TOKEN)

async function getImage(index) {
  const html = await fetch(BBF).then(r => r.text())
  const document = parse(html)
  const comics = document.querySelectorAll('.comic')
  // get the n-th last image
  const comic = comics[comics.length - index - 1]
  const image = comic.querySelector('img')
  const url = `${BBF}/${image.getAttribute('src')}`
  return url
}

async function post() {
  const picturesCount = (await db.read())?.picturesCount ?? 0
  const url = await getImage(picturesCount)
  await bot.telegram.sendPhoto(`@${process.env.CHANNEL_ID}`, url)
  await db.write({ picturesCount: picturesCount + 1 })
}

post().then(() => {
  console.log('methposting done successfully')
}, console.log)
