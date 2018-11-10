
var express = require('express')
var app = express()
var http = require('http');
const {database} = require('../db.js')
let axios = require('axios');
let cheerio = require('cheerio');
let fs = require('fs');
var url = require('url');
app.get('/', async function (req, res, next) {
    res.render('site/index', {
        title: 'Add content',
        data: []
    })
})
app.get('/search-cars', async function (req, res, next) {
    res.render('site/search_cars', {
        title: 'Search Cars',
        data: []
    })
})

app.get('/search-results', async function (req, res, next) {
    var q = url.parse(req.url, true).query;
    var path = 'https://www.autotrader.co.uk/car-search?postcode=wv23aq&make=' + q.make + '&model=' + q.model;
    axios.get(path)
            .then((response) => {
                if (response.status === 200) {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    var filters = {};
                    var radius = {};
                    var make = {};
                    var model = {}
                    var model_variant = {}
                    $(html).find("select[name=radius] option").each(function (i, elem) {
                        radius[i] = {
                            value: $(this).val(),
                            text: $(this).text(),
                        }

                    });
                    $('.sf-flyout__scrollable-options').each(function (i, elem) {
                        filters[i] = {
                            filter: $(this).html(),
                        }
                    });
                    $(filters[0].filter).find(".js-value-button").each(function (i, elem) {
                        make[i] = {
                            value: $(this).data('selected-value'),
                            text: $(this).data('selected-display-name'),
                            count: $(this).find('span.count').text(),
                        }

                    });
                    $(filters[1].filter).find(".js-value-button").each(function (i, elem) {
                        model[i] = {
                            value: $(this).data('selected-value'),
                            text: $(this).data('selected-display-name'),
                            count: $(this).find('span.count').text(),
                        }

                    });
                    $(filters[2].filter).find(".js-value-button").each(function (i, elem) {
                        model_variant[i] = {
                            value: $(this).data('selected-value'),
                            text: $(this).data('selected-display-name'),
                            count: $(this).find('span.count').text(),
                        }

                    });
                    filters = {
                        radius: radius,
                        make: make,
                        model: model,
                        model_variant: model_variant,
                    }

                    var obj = {'cars': q, filters: filters}
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(obj));
                }
            }, (error) => console.log(err));

})
app.get('/auto-search-results', async function (req, res, next) {
    var q = url.parse(req.url, true).query;
    var path = 'https://www.autotrader.co.uk/results-car-search?radius=' + q.radius + '&make=' + q.make + '&model=' + q.model;
    axios.get(path)
            .then((response) => {
                if (response.status === 200) {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    var cars = {}, filters = {}, radius = {}, make = {}, model = {}, model_variant = {}
                    $(html.html).find('li.search-page__result').each(function (i, elem) {
                        cars[i] = {
                            product_id: $(this).attr('id'),
                            name: $(this).find('h2').text().trim(),
                            image: $(this).find(".listing-main-image .js-click-handler img").attr('src'),
                            listings: $(this).find(".listing-key-specs").html(),
                            title: $(this).find("p.listing-attention-grabber").text(),
                            description: $(this).find("p").text(),
                            price: $(this).find(".vehicle-price").text(),
                        }
                    });
                    $('<div>' + html.refinements.fields[0].html + '</div>').find(".value-button").each(function (i, elem) {
                        radius[i] = {
                            value: $(this).data('selected-value'),
                            text: $(this).data('selected-display-name'),
                        }
                    });
                    $('<div>' + html.refinements.fields[1].html + '</div>').find(".value-button").each(function (i, elem) {
                        make[i] = {
                            value: $(this).data('selected-value'),
                            text: $(this).data('selected-display-name'),
                            count: $(this).find('span').text(),
                        }
                    });
                    $('<div>' + html.refinements.fields[2].html + '</div>').find(".value-button").each(function (i, elem) {
                        model[i] = {
                            value: $(this).data('selected-value'),
                            text: $(this).data('selected-display-name'),
                            count: $(this).find('span').text(),
                        }
                    });
                    filters = {
                        radius: radius,
                        make: make,
                        model: model,
                    }
                    data = {
                        filters: filters,
                        count: html.refinements.count,
                        cars: cars
                    }
                    res.end(JSON.stringify(data));
                }
            }
            , (error) => console.log(err));
})
app.get('/product_search', async function (req, res, next) {
    var q = url.parse(req.url, true).query;
    var path = 'https://www.autotrader.co.uk/classified/advert/' + q.id;
    axios.get(path)
            .then((response) => {
                if (response.status === 200) {
                    const html = response.data;
                    const $ = cheerio.load(html);
                    var overview = [];
                    var thumbs = [];
                    var details = [];
                    var phones = [];
                    $('ul.keyFacts__list li').each(function (i, elem) {
                        overview[i] = {
                            view: $(this).html(),
                        }
                    });
                    $('.fpaImages__thumbs figure.fpaImages__thumb').each(function (i, elem) {
                        thumbs[i] = {
                            thumb: $(this).find('img').data('src'),
                        }
                    });
                    $('.seller_private__telephone').each(function (i, elem) {
                        phones[i] = {
                            phone: $(this).text(),
                        }
                    });
                    if (phones) {
                        phones = $(html).find('.seller_private__telephone').text();
                    }
                    $('section.fpaSpecifications .fpaSpecifications__expandingSection').each(function (i, elem) {
                        details[i] = {
                            detail_heading: $(this).find('h3').text(),
                            detail: $(this).find('.fpaSpecifications__list').html(),
                        }
                    });
                    var data = {
                        overview: overview,
                        desc: $(html).find(".fpa-description-text").text(),
                        thumbs: thumbs,
                        title: $(html).find("h1 span.vehicle-title__text").text(),
                        phones: $(html).find("section.seller_trade .seller_trade__telephone").text(),
                        phone2: $(html).find(".seller_private__telephone").text(),
                        price: $(html).find(".vehicle-price-info--total p").text(),
                        distance: $(html).find(".seller_private__location").text(),
                        details: details,
                    }
                    var obj = {'cars': q, 'data': data}
                    res.writeHead(200, {'Content-Type': 'application/json'});
                    res.end(JSON.stringify(obj));
                }
            }, (error) => console.log(err));
})


app.get('/class-wise', async function (req, res, next) {
    var topic
    var subject
    var current_subs = req.query.id;
    var query = 'SELECT * FROM tbl_topic where class_id = ' + req.query.id;
    topic = await database.query(query, []);
    var query = 'SELECT * FROM tbl_class GROUP BY class_name ORDER BY id ASC';
    subject = await database.query(query, []);
    var data = {
        subject: JSON.parse(subject),
        topic: JSON.parse(topic),
        current_subs: current_subs
    }
    res.render('site/class-wise', {
        title: 'Class List',
        data: data
    })
})
module.exports = app;
