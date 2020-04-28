export default (req, res) => {
  console.log(req.body)
  res.json({ status: 'success' })
}
