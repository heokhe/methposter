import * as dotenv from 'dotenv'
import fetch from 'node-fetch'
import { parse } from 'node-html-parser'
import { JSONFile } from 'lowdb'
import { Telegraf } from 'telegraf'

dotenv.config()

const BBF = 'https://breakingbadfunny.com'

const db = new JSONFile('db.json')
const bot = new Telegraf(process.env.TOKEN)

async function post() {
  const html = await fetch(BBF).then(r => r.text())
  const document = parse(html)
  const comics = document.querySelectorAll('.comic')
  const postedCount = (await db.read())?.picturesCount ?? 0

  if (postedCount >= comics.length) {
    // In this case all of the photos have been posted so we don't need to go further
    return false
  }

  // get the n-th last image
  const comic = comics[comics.length - postedCount - 1]
  const imagePath = comic.querySelector('img').getAttribute('src')
  const url = new URL(imagePath, BBF).href
  await bot.telegram.sendPhoto(`@${process.env.CHANNEL_ID}`, url)
  await db.write({ picturesCount: postedCount + 1 })
  return true
}

post().then(posted => {
  console.log(posted ? 'methposting done successfully' : 'no new post')
}, console.log)
