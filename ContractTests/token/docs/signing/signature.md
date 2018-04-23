---
title: Smart Contract Confirmation Process
author: Yao Sun
date: August 28th 2017
---

Following document is to aid in the consistent style and expectations when confirming code. The granularity chosen is per line, so every line of code should be signed if you deem it necessary. At the end of the process, lines _without_ a comment atop are assumed to be trivial therefore unecessary to confirm.

## Signing

Aside: DoxyDoxygen provides easier formatting on sublime text for formatting comments.

Signing your name (you may choose style but stay consistent) indicates you have read and verified the code presented. Most functions have a function header, if not, following the recommended style, with the addition of signatures:

~~~~ 
    /**
     * @dev         {description}
     *
     * @param       {param_name}  {param purpose}
     *
     * @signed      {signature name 1} {dd/mm/yy}
     * @signed      {signature name 2} {dd/mm/yy}
     *
     * @modified    {name} {dd/mm/yy}
     */
~~~~

Signing only the function header means you have read through the whole function. If there are any comments to lines within the comment (or you feel like the line is important enough to warrant its own signature), place the following into the code:

~~~~
    /**
     * {Line description, comments etc}
     * @signed {signature name} {dd/mm/yy}
     *
     * {Response to previous comment, or additional comments}
     * @signed {signature names} {dd/mm/yy}
     */
~~~~


Resist removing or modifying existing comments, the confirmation process should only be additive. If you are writing concerns within the comments, its also a good idea to start a new issue on the repository to keep track of it. Additionally, since ``@signed`` corresponds to a confirmation, only use it when your comment is not a concern! Address concerns first, then sign.