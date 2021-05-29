#!/usr/bin/env node

/*
* @Author: Allan Jackson
* @Date:   2021-05-29 14:51:19
* @Last Modified by:   Allan Jackson
* @Last Modified time: 2021-05-29 14:51:19
*/

'use strict'

const yargs = require('yargs')
const request = require('request')
const ora = require('ora')
const Table = require('cli-table')
const chalk = require('chalk')

const BASE_URL = 'https://api.github.com/'

/**
 * Display `contribute` message alongwith link to the repo
 */
const contributeLink = () => {
  console.log(chalk.yellow('Contribute to this project - https://github.com/ajax6255/gitfinger'))
}

const argv = yargs
  .usage('Usage: $0 <command> [arguments]')
  .command('user', 'Fetch information about any GitHub user', function (yargs) {
    const argv = yargs
      .usage('Usage: $0 user <github_username>')
      .demand(2)
      .example('$0 user ajax6255')
      .argv

    // Fetch username from command line arguments
    var username = argv._[1]

    // Display an animating loader
    const spinner = ora('Fetching information from GitHub').start()

    // Options for making request to GitHub API
    // Setting `User-Agent` header in the request is required by GitHub API
    var options = {
      url: BASE_URL + 'users/' + username,
      headers: {
        'User-Agent': 'User-' + username
      }
    }

    // Make HTTP GET request to GitHub API endpoint
    request.get(options, function (err, response) {
      // Stop the animating loader
      spinner.stop()

      if (err) {
        requestFailed()
      }
      else {
        const userInfo = JSON.parse(response.body)



        // Draw table for displaying user information
        // Defining table's headers and it's other properties
        var userInfoTable = new Table({
          head: ['Followers', 'Public Repos', 'Following'],
          colWidths: [15, 15, 15],
          style: {
            head: ['cyan']
          }
        })
        // Adding one row to the table
        userInfoTable.push(
          [userInfo.followers, userInfo.public_repos, userInfo.following]
        )

        if (userInfo.login)
          console.log(chalk.cyan('Username: ') + userInfo.login)
        if (userInfo.name)
          console.log(chalk.cyan('Full Name: ') + userInfo.name)
        if (userInfo.bio)
          console.log(chalk.cyan('Profile Bio: ') + userInfo.bio)
        if (userInfo.blog)
          console.log(chalk.cyan('Website Link: ') + userInfo.blog)
        if (userInfo.location)
          console.log(chalk.cyan('User Location: ') + userInfo.location)
        if (userInfo.html_url)
          console.log(chalk.cyan('GitHub Profile Link: ') + userInfo.html_url)
        // Displaying the table
        console.log(userInfoTable.toString())

        contributeLink()
        process.exit(-1)
      }
    })
  })
.command('repo', 'Fetch information about any GitHub repository', function (yargs) {
    const argv = yargs
      .usage('Usage: $0 repo <repo_owner_username> <repo_name>')
      .demand(3)
      .example('$0 repo ajax6255 gitfinger')
      .argv

    // Fetch username and repo name from command line arguments
    var username = argv._[1]
    var reponame = argv._[2]

    // Display an animating loader
    const spinner = ora('Fetching information from GitHub').start()

    // Options for making request to GitHub API
    // Setting `User-Agent` header in the request is required by GitHub API
    var options = {
      url: BASE_URL + 'repos/' + username + '/' + reponame,
      headers: {
        'User-Agent': 'User/Repo-' + username + '/' + reponame
      }
    }

    // Make HTTP GET request to GitHub API endpoint
    request.get(options, function (err, response) {
      // Stop the animating loader
      spinner.stop()

      if (err) {
        requestFailed()
      }
      else {
        const repoInfo = JSON.parse(response.body)

        check403(response, repoInfo)
        check404(response, true)

        // Draw table for displaying repo information
        // Defining table's headers and it's other properties
        var repoInfoTable = new Table({
          head: ['Watching', 'Stars', 'Forks', 'Issues'],
          colWidths: [15, 15, 15, 15],
          style: {
            head: ['cyan']
          }
        })
        // Adding one row to the table
        repoInfoTable.push(
          [repoInfo.subscribers_count, repoInfo.stargazers_count, repoInfo.forks_count, repoInfo.open_issues_count]
        )

        if (repoInfo.name)
          console.log(chalk.cyan('Name: ') + repoInfo.name)
        if (repoInfo.full_name)
          console.log(chalk.cyan('Full Name: ') + repoInfo.full_name)
        if (repoInfo.description)
          console.log(chalk.cyan('Description: ') + repoInfo.description)
        if (repoInfo.language)
          console.log(chalk.cyan('Language: ') + repoInfo.language)
        if (repoInfo.html_url)
          console.log(chalk.cyan('GitHub Link: ') + repoInfo.html_url)
        // Displaying the table
        console.log(repoInfoTable.toString())

        contributeLink()
        process.exit(-1)
      }
    })
  })
  .help('help')
  .alias('h', 'help')
  .epilog('Copyright © Allan Jackson (ajax6255)')
  .argv
