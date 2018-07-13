# PDF Checker

Built because of a simple mistake I made during my job search. Some of the links I had on my resume worked on my computer because the browser was automatically redirecting it to the correct page. But, it showed up as a dead link whenever opened from a different computer or mobile. Searched online for similar to check of broken links in PDF. I couldn't find one so quickly made a web app. Works with most PDF documents. Links in any web page can also be checked by simply saving it as PDF document and then uploading it.

Works Done:
• Made a custom python module based on pdfminer for extracting links.
• Wrapped the module with loopback service and built an API for extracting links.
• Built a links checker API that checks for broken links in the pdf.
• Built a responsive front-end service using react framework.
• Tested API endpoints for various test case URLs and maximum coverage.

Live Site available at: https://pdffeed.com
