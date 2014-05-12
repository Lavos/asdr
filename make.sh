#!/bin/bash
shopt -s nullglob

USAGE="USAGE: make.sh namespace min|src > [file]"
NAMESPACE=$1
COMPRESSION=$2

SED_COMMANDS="s|__LIBRARY_NAME__|$1|g"

FIRST='src/library/first.js'
LAST='src/library/last.js'
MODULES=(src/modules/*.js)
TEMPLATES=(src/templates/*.jst)
STYLES=(src/styles/*.css)

FIRST_BLOB=''
LAST_BLOB=''
MODULES_BLOB=()
TEMPLATES_BLOB=()
STYLES_BLOB=()

case $COMPRESSION in
	min)
		FIRST_BLOB=$(sed $SED_COMMANDS < "$FIRST" | ./minify.sh)
		LAST_BLOB=$(sed $SED_COMMANDS < "$LAST" | ./minify.sh)

		for src in "${MODULES[@]}"
		do
			content=$(sed $SED_COMMANDS < "$src" | ./minify.sh)
			MODULES_BLOB+=("$content")
		done
	;;

	src)
		FIRST_BLOB=$(sed $SED_COMMANDS < "$FIRST")
		LAST_BLOB=$(sed $SED_COMMANDS < "$LAST")

		for src in "${MODULES[@]}"
		do
			content=$(sed $SED_COMMANDS < "$src")
			MODULES_BLOB+=("$content")
		done
	;;

	*)
		echo "You must specify a compression." >&2
		echo $USAGE >&2
		exit
	;;
esac

# templates and styles are processed the same in both cases
for src in "${TEMPLATES[@]}"
do
	filename=$(basename "$src")
	template=$(./embed.sh template $NAMESPACE "$filename" < "$src")
	TEMPLATES_BLOB+=("$template")
done

for src in "${STYLES[@]}"
do
	filename=$(basename "$src")
	style=$(./embed.sh style $NAMESPACE "$filename" < "$src")
	STYLES_BLOB+=("$style")
done

# output the script in the proper order
echo "// $(date)"
echo "// $(git rev-parse HEAD)"
echo "$FIRST_BLOB"

printf "%s\n" "${MODULES_BLOB[@]}"

if [[ ${#TEMPLATES_BLOB[@]} -gt 0 ]]
then
	printf "%s\n" "${TEMPLATES_BLOB[@]}"
fi

if [[ ${#STYLES_BLOB[@]} -gt 0 ]]
then
	printf "%s\n" "${STYLES_BLOB[@]}"
fi

echo "$LAST_BLOB"

echo "Processed ${#MODULES_BLOB[@]} modules." >&2
echo "Processed ${#TEMPLATES_BLOB[@]} templates." >&2
echo "Processed ${#STYLES_BLOB[@]} styles." >&2
echo "Build completed successfully." >&2
