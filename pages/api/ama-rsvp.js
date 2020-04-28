import AirtablePlus from 'airtable-plus'
import dotenv from 'dotenv'

dotenv.config()

const airtable = new AirtablePlus({
  baseID: process.env.AIRTABLE_AMA_BASE,
  apiKey: process.env.AIRTABLE_API_KEY,
  tableName: 'Students'
})

function generateAMA(currentAMAs, newAMA) {
  if (typeof currentAMAs == 'undefined') {
    return [`${newAMA}`]
  }

  return [...currentAMAs, `${newAMA}`]
}

function getRelationship(str) {
  let get = {
    'club-leader': 'Club Leader',
    'club-member': 'Club Member',
    'slack-member': 'Slack Member',
    alum: 'Alumni',
    none: 'No relation'
  }

  return get[str]
}

export default async (req, res) => {
  const json = JSON.parse(req.body)

  // check if record exists
  let record = await airtable.read({
    filterByFormula: `{Email} = "${json.email}"`,
    maxRecords: 1
  })

  if (record.length == 1) {
    record = record[0]

    if ((record.fields.AMAs || []).includes(json.id)) {
      return res.json({ status: 'success', waiver: record.fields.Waiver })
    }

    // append AMA and return positive
    await airtable.update(record.id, {
      AMAs: generateAMA(record.fields.AMAs, json.id)
    })
    return res.json({ status: 'success', waiver: record.fields.Waiver })
  }

  // create record & append AMA
  await airtable.create({
    Name: json.name,
    'Slack Handle': json.slack,
    Email: json.email,
    'Relationship to Hack Club': getRelationship(json.association),
    AMAs: [`${json.id}`]
  })

  console.log('working')

  res.json({ status: 'success', waiver: false })
}
