import UIDGenerator from 'uid-generator'

const uidgen = new UIDGenerator(null, 23)

const templateInvite = (projectName, link) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd" />
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
  <head> </head>
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="x-apple-disable-message-reformatting" />
    <!--[if !mso]><!-->
    <meta http-equiv="X-UA-Compatible" content="IE=edge" />
    <!--<![endif]-->
    <style type="text/css">
      * {
        text-size-adjust: 100%;
        -ms-text-size-adjust: 100%;
        -moz-text-size-adjust: 100%;
        -webkit-text-size-adjust: 100%;
      }

      html {
        height: 100%;
        width: 100%;
      }

      body {
        height: 100% !important;
        margin: 0 !important;
        padding: 0 !important;
        width: 100% !important;
        mso-line-height-rule: exactly;
      }

      div[style*="margin: 16px 0"] {
        margin: 0 !important;
      }

      table,
      td {
        mso-table-lspace: 0pt;
        mso-table-rspace: 0pt;
      }

      img {
        border: 0;
        height: auto;
        line-height: 100%;
        outline: none;
        text-decoration: none;
        -ms-interpolation-mode: bicubic;
      }

      .ReadMsgBody,
      .ExternalClass {
        width: 100%;
      }

      .ExternalClass,
      .ExternalClass p,
      .ExternalClass span,
      .ExternalClass td,
      .ExternalClass div {
        line-height: 100%;
      }
    </style>
    <!--[if gte mso 9]>
      <style type="text/css">
      li { text-indent: -1em; }
      table td { border-collapse: collapse; }
      </style>
      <![endif]-->
    <title>${projectName} Invitation - DullahanCMS</title>
    <!-- content -->
    <!--[if gte mso 9]><xml>
       <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
       </o:OfficeDocumentSettings>
      </xml><![endif]-->
  </head>
  <body class="body" style="background-color: #F5F7FA; margin: 0; width: 100%;">
    <table class="bodyTable" role="presentation" width="100%" align="left" border="0" cellpadding="0" cellspacing="0" style="width: 100%; background-color: #F5F7FA; margin: 0;" bgcolor="#F5F7FA">
      <tr>
        <td class="body__content" align="left" width="100%" valign="top" style="color: #000000; font-family: Helvetica,Arial,sans-serif; font-size: 16px; line-height: 20px;">
          <div class="container" style="width: 100%; margin: 10px auto; max-width: 495px; margin-top: 32px;"> <!--[if mso | IE]>
            <table class="container__table__ie" role="presentation" border="0" cellpadding="0" cellspacing="0" style=" margin-right: auto; margin-left: auto;width: 495px" width="495" align="center">
              <tr>
                <td> <![endif]-->
                  <table class="container__table" role="presentation" border="0" align="center" cellpadding="0" cellspacing="0" width="100%">
                    <tr class="container__row">
                      <td class="container__cell" width="100%" align="left" valign="top" style="border-radius: 5px; padding: 16px 16px 24px; background-color: #FFFFFF;" bgcolor="#FFFFFF">
                        <div class="row">
                          <table class="row__table" width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
                            <tr class="row__row">
                              <td class="column col-sm-12" width="495" style="padding: 0;width: 100%" align="left" valign="top">
                                <p class="text p" style="display: block; color: #000000; font-family: Helvetica,Arial,sans-serif; line-height: 1.43; margin: 0; font-size: 16px; margin-bottom: 8px;">Hi!,</p>
                                <p class="text p" style="display: block; color: #000000; font-family: Helvetica,Arial,sans-serif; font-size: 14px; line-height: 1.43; margin: 0; margin-bottom: 24px;">You are invited to be collaborator in <b>${projectName}</b>. You can accept the invitation by clicking the button below.</p>
                              </td>
                            </tr>
                          </table>
                        </div>
                        <div class="row" style="margin-bottom: 24px;">
                          <table class="row__table" width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
                            <tr class="row__row">
                              <td class="column col-sm-12" width="495" style="padding: 0;width: 100%" align="left" valign="top">
                                <div class="button" style="margin: 0 auto;">
                                  <table role="presentation" width="100%" align="left" border="0" cellpadding="0" cellspacing="0">
                                    <tr>
                                      <td>
                                        <table role="presentation" width="auto" align="center" border="0" cellspacing="0" cellpadding="0" class="button__table" style="margin: 0 auto;">
                                          <tr>
                                            <td align="center" class="button__cell" style="background-color: #0A1743; border-radius: 4px; padding: 16px;" bgcolor="#0A1743"><a href="${link}" class="button__link" style="color: #FFFFFF; text-decoration: none; background-color: #0A1743; font-size: 14px; display: inline-block;"><span class="button__text" style="color: #FFFFFF; text-decoration: none;">Accept Invitation</span></a></td>
                                          </tr>
                                        </table>
                                      </td>
                                    </tr>
                                  </table>
                                </div>
                              </td>
                            </tr>
                          </table>
                        </div>
                        <div class="row">
                          <table class="row__table" width="100%" align="center" role="presentation" border="0" cellpadding="0" cellspacing="0" style="table-layout: fixed;">
                            <tr class="row__row">
                              <td class="column col-sm-12" width="495" style="padding: 0;width: 100%" align="left" valign="top">
                                <p class="text p" style="display: block; color: #000000; font-family: Helvetica,Arial,sans-serif; font-size: 14px; line-height: 1.43; margin: 0;">Have Questions? Feel free to email us at <a href="mailto:dullahan@evius.id" class="a" style="color: #289F97;"><span class="a__text" style="color: #289F97;">dullahan@evius.id</span></a></p> <br/>
                                <p class="text p" style="display: block; color: #000000; font-family: Helvetica,Arial,sans-serif; font-size: 14px; line-height: 1.43; margin: 0;">Have a Great Day,</p>
                                <p class="text p" style="display: block; color: #000000; font-family: Helvetica,Arial,sans-serif; font-size: 14px; line-height: 1.43; margin: 0;">Evius Team</p>
                              </td>
                            </tr>
                          </table>
                        </div>
                      </td>
                    </tr>
                  </table> <!--[if mso | IE]> </td>
              </tr>
            </table> <![endif]--> </div>
        </td>
      </tr>
    </table>
    <div style="display:none; white-space:nowrap; font-size:15px; line-height:0;">&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; </div>
  </body>
</html>
`

module.exports = {
	async add(ctx, req) {
		try {
			const readApiKey = await uidgen.generate()
			const writeApiKey = await uidgen.generate()
			const result = await ctx.utils.db.insert(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: 'projects',
				body: {
					name: req.body.name,
					owner: req.current._id,
					readApiKey: readApiKey,
					writeApiKey: writeApiKey,
					userIds: [req.current._id],
					cors: []
				},
				query: req.query
			})

			Object.assign(ctx.dbsConnection, {[result._id.toString()]: ctx.utils.db.sideConnection(ctx.dbsConnection[ctx.CORE_DB], result._id.toString())})
			try {
				await ctx.utils.schema.update(ctx, result._id.toString())
				return result
			} catch (err) {
				console.log(err)
			}
		} catch (err) {
			throw err
		}
	},

	async delete(ctx, req) {
		try {
			await ctx.utils.db.delete(ctx, {
				projectId: ctx.CORE_DB,
				schemaId: 'projects',
				objectKey: req.params.projectId,
				query: req.query
			})

			// DROP DATABASE
			try {
				ctx.dbsConnection[req.params.projectId].dropDatabase()
				delete ctx.dbsConnection[req.params.projectId]
				delete ctx.dbs[req.params.projectId]
			} catch (err) {
				return err
			}

			return `${req.params.projectId} successfully deleted`
		} catch (err) {
			throw err
		}
	},

	async invite(ctx, req) {
		return new Promise(async (resolve, reject) => {
			try {
				// check user exist
				// if not exist then set password first
				// else sent invitation

				// email invitation
				// if email already registered
				// in url /invite/token
				// accept -> change in project collaborators and redirect to login

				// if email not registered
				// sent url /register?invite_token=1234567890
				// redirect to /change-password
				// save password -> change in project collaborators and redirect to login

				const project = await ctx.utils.db.findOne(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'projects',
					objectKey: req.params.projectId
				})

				let user = await ctx.utils.db.findOneByQuery(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'users',
					query: {
						email: req.body.email
					}
				})

				if(project.userIds && user && project.userIds.includes(user.id)) {
					return reject('already invited')
				}

				const newToken = await uidgen.generate()
				const mainUrl = `https://dullahan.evius.id`
				let link = `${mainUrl}/invitation-confirm?invite_token=${newToken}`

				// if user not exist
				if(!user) {
					link = `${mainUrl}/register?invite_token=${newToken}`
				}

				await ctx.utils.db.insert(ctx, {
					projectId: ctx.CORE_DB,
					schemaId: 'CORE_CREDENTIALS',
					body: {
						token: newToken,
						params: {
							email: req.body.email,
							projectId: req.params.projectId
						},
						isValid: true,
						state: 'INVITE'
					}
				})

				ctx.utils.mail.send({
					from: `DullahanCMS by Evius Industri - ${process.env.EMAIL_USERNAME}`,
					to: req.body.email,
					subject: `${project.name} Invitation - DullahanCMS`,
					html: templateInvite(project.name, link)
				})

				resolve('success')
			} catch (err) {
				console.log(err)
				reject(err)
			}
		})
	}
}