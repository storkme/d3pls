/**
 * Created by alex.storkey on 27/08/2014.
 */

module.exports = function (heroes, clazz) {
    var result = [];
    heroes.forEach(function (hero) {
        if (hero.level === 70
            && !hero.dead
            && hero.class === clazz)
            result.add(hero);
    });

    return heroes.sort(function (a, b) {
        return a['last-updated'] - b['last-updated'];
    });
};