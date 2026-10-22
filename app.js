// Entry point bridge for cPanel Phusion Passenger
process.env.NODE_ENV = process.env.NODE_ENV || 'production'
import('./.output/server/index.mjs')
