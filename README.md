# Vispero Standards Support
Contains documentation for Vispero software support of Web standards (HTML, CSS, SVG and ARIA).

## JAWS support
* [ARIA Roles, States and Properties](aria.html)
* CSS(future link)
* [HTML](html.html)
* SVG(future link)

## Reporting issues

If you find an issue with JAWS support for ARIA, CSS, HTML, or SVG, please [file an issue](https://github.com/FreedomScientific/VFO-standards-support/issues?q=is%3Aopen) with the following information:
* Concise title that summarises the issue;
* Brief description of the issue;
* JAWS version;
* Name and version of the OS and browser;
* Expected result
* Actual result
* Test case that demonstrates the issue - provide linked test case codepen/JSbin etc.

Note: please do not file general support issues here. Please [contact Freedom Scientific](https://www.freedomscientific.com/About/ContactUs) to report general issues with JAWS.

## Triaging Procedure for Authorized Testers

Workflow is as follows:

1. Find an unassigned issue. [Here is a good set of filters to start with](https://github.com/FreedomScientific/VFO-standards-support/issues?q=is%3Aissue+is%3Aopen+sort%3Acreated-asc+-label%3Abug+-label%3Aarchive+no%3Aassignee+-label%3A%22Not+a+JAWS+bug%22+-label%3A%22Feature+Request%22+-label%3A%22JAWS+bug+filed%22)
2. Once you identify an issue to work on, make sure the author followed the guidelines provided above. If not, tag them in a comment asking for more info and tag the ticket with the "More Info Needed" label.
3. Assign the ticket to yourself and start investigating.

### Resolution

* If the issue is fixed in the most recent version of JAWS, tag ticket with "Fixed in JAWS 20XX" label and close.
* If the issue stands after testing with the most recent version of JAWS, document your research in a comment and assign issue to Brett Lewis.
* If you can't reproduce the issue, ask more questions of the issue author. You can also reach out to Brett Lewis with clarification questions. When you're confident the issue can't be duplicated, tag it with the "Can't Reproduce" label and close.
* If Issue appears to be browser specific instead of JAWS related, document your research in a comment, tag ticket with appropriate browser issue label (i.e. "Chrome Bug") and close. Ideally you should also [file a bug on the browser](https://web.dev/how-to-file-a-good-bug/) if a similar one hasn't already been reported.
* If after asking questions of the author you don't hear back within a reasonable amount of time (at least 14 days) and you don't have enough to go on, tag the issue with the "archive" label and close.
