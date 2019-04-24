async function fetch_template(url) {
    var response = await fetch(url)
    if (!response.ok)
        throw("failed to load template " + url)

    var template = await response.text()
    return template
}

async function preload_templates(templatesToFetch) {
    var templates = {}
    for (var i = 0; i < templatesToFetch.length; i++) {
        var tplName = templatesToFetch[i]
        templates[tplName] = await fetch_template('templates/' + tplName + '.html')
    }
    return templates
}

// Returns the property of an object that belongs to key, or defaultVal, if there is no such property in the object
function propertyOrDefault(object, key, defaultVal) {
    return (object[key] == undefined) ? defaultVal : object[key];
}

