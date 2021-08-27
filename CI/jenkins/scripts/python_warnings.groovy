/*
 * Warnings-NG Jenkins plugin parser for Python warnings
*/
import edu.hm.hafner.analysis.Severity

Integer line = Integer.parseInt(matcher.group(2))

return builder.setFileName( matcher.group(1))
    .setLineStart(line)
    .setCategory(matcher.group(3))
    .setMessage(matcher.group(4))
    .buildOptional()

// EXAMPLE: "/usr/local/lib/python3.7/site-packages/flask_sqlalchemy/__init__.py:873: FSADeprecationWarning: SQLALCHEMY_TRACK_MODIFICATIONS adds significant overhead and will be disabled by default in the future.  Set it to True or False to suppress this warning."
