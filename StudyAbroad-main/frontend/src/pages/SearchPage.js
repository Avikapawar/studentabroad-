import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Function to get university-specific images
const getUniversityImage = (university) => {
  const universityImages = {
    // US Universities
    'Harvard University': 'https://image-static.collegedunia.com/public/college_data/images/studyabroad/appImage/college_1090_29-15:00_o-HARVARD-UNIVERSITY-BUILDING-facebook.jpeg',
    'Stanford University': 'https://images.shiksha.com/mediadata/images/1533535408phpRuopAS.jpeg',
    'MIT': 'https://www.mit.edu/files/images/202505/MIT-This-is-MIT-SLsub_0_0.jpg',
    'Massachusetts Institute of Technology': 'https://www.mit.edu/files/images/202505/MIT-This-is-MIT-SLsub_0_0.jpg',
    'Yale University': 'https://ycwd.memberclicks.net/assets/aboutyale.png',
    'Princeton University': 'https://i0.wp.com/unusualplaces.org/wp-content/uploads/2022/12/Depositphotos_74368003_S.jpg?fit=1000%2C565&ssl=1&w=640',
    'Columbia University': 'https://a.storyblok.com/f/64062/816x460/2b8246a4c6/columbia-campus.jpg',
    'University of Pennsylvania': 'https://media.cntraveler.com/photos/5c1137222a1ed14acdea31a2/master/pass/GettyImages-594949892.jpg',
    'Carnegie Mellon University': 'https://stubard.com/wp-content/uploads/2025/04/Carnegie-Mellon-University.jpg',
    'California Institute of Technology': 'https://images.www.caltech.edu/main/images/Beckman-Institute_52_Seth_Han.2e16d0ba.fill-534x300-c100.jpg',
    'University of Chicago': 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0a/28/d7/7c/saieh-hall-for-economics.jpg?w=900&h=500&s=1',
    'Cornell University': 'https://upload.wikimedia.org/wikipedia/commons/thumb/4/47/Cornell_University%2C_Ithaca%2C_NY.jpg/1200px-Cornell_University%2C_Ithaca%2C_NY.jpg',
    'Duke University': 'https://admissions.duke.edu/wp-content/uploads/2019/04/DukeChapel_2016.jpg',
    'Northwestern University': 'https://www.northwestern.edu/brand/images/photos/campus-lakefill-2.jpg',
    'Johns Hopkins University': 'https://hub.jhu.edu/assets/uploads/2019/04/gilman_hall_hero-1400x700.jpg',
    'University of California, Berkeley': 'https://www.berkeley.edu/wp-content/uploads/2016/12/sather-gate-1.jpg',
    'University of California, Los Angeles': 'https://www.ucla.edu/img/home-hero/campus-aerial.jpg',
    'University of Southern California': 'https://about.usc.edu/files/2017/05/USC_Bovard_Auditorium.jpg',
    'New York University': 'https://www.nyu.edu/content/dam/nyu/global/global-home/images/locations/newyork/washington-square-park.jpg',
    'Boston University': 'https://www.bu.edu/files/2018/05/18-2733-BU-Campus-002.jpg',
    'University of Rochester': 'https://www.rochester.edu/college/ccas/assets/images/rush-rhees-library.jpg',
    'Case Western Reserve University': 'https://case.edu/studentlife/sites/case.edu.studentlife/files/styles/feature_image_large/public/2019-08/quad-summer.jpg',
    'Northeastern University': 'https://www.northeastern.edu/graduate/blog/wp-content/uploads/2019/03/northeastern-university-campus.jpg',
    'University of Miami': 'https://welcome.miami.edu/_assets/images/campus-life/campus-beauty/campus-beauty-1.jpg',
    'Tulane University': 'https://tulane.edu/sites/default/files/styles/hero_image/public/hero-images/gibson-quad-aerial.jpg',

    // UK Universities
    'Oxford University': 'https://cdn.britannica.com/03/117103-050-F4C2FC83/view-University-of-Oxford-England-Oxfordshire.jpg',
    'University of Oxford': 'https://cdn.britannica.com/03/117103-050-F4C2FC83/view-University-of-Oxford-England-Oxfordshire.jpg',
    'Cambridge University': 'https://cdn.britannica.com/85/13085-050-C2E88389/Corpus-Christi-College-University-of-Cambridge-England.jpg',
    'University of Cambridge': 'https://cdn.britannica.com/85/13085-050-C2E88389/Corpus-Christi-College-University-of-Cambridge-England.jpg',
    'Imperial College London': 'https://www.imperial.ac.uk/ImageCropToolT4/imageTool/uploaded-images/newseventsimage_1694176603297_mainnews2012_x1.jpg',
    'University College London': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS14m7a8tVAS3NrKbdHKmdZAkRX78Hxr_TYA&s',
    'London School of Economics': 'https://upload.wikimedia.org/wikipedia/commons/f/f7/The_Land_Registry_Offices%2C_Lincoln_Inn_Fields.jpg',
    'King\'s College London': 'https://static.wixstatic.com/media/106560_cf1f3095fd234eb59c6e2282c01a6d60~mv2.jpeg/v1/fill/w_568,h_426,al_c,q_80,usm_0.66_1.00_0.01,enc_avif,quality_auto/106560_cf1f3095fd234eb59c6e2282c01a6d60~mv2.jpeg',
    'University of Edinburgh': 'https://dynamic-media-cdn.tripadvisor.com/media/photo-o/17/f8/e6/41/photo1jpg.jpg?w=900&h=500&s=1',
    'University of Manchester': 'https://www.uominnovationfactory.com/wp-content/uploads/2025/04/UoM-buildings-1920x1080.jpg',
    'University of Warwick': 'https://warwick.ac.uk/about/visiting/directions/campus/library_square_2.jpg',
    'University of Bristol': 'https://www.bristol.ac.uk/media-library/sites/homepage/2018/wills-memorial-building.jpg',
    'University of Glasgow': 'https://www.gla.ac.uk/media/Media_227425_smxx.jpg',
    'University of Birmingham': 'https://www.birmingham.ac.uk/Images/College-of-EPS-only/GEES/news/aston-webb-building.jpg',
    'University of Nottingham': 'https://www.nottingham.ac.uk/impactcampaign/images/trent-building-2.jpg',
    'University of Sheffield': 'https://www.sheffield.ac.uk/sites/default/files/styles/hero_image/public/2019-10/firth-court-autumn.jpg',
    'University of Leeds': 'https://www.leeds.ac.uk/images/homepage-parkinson-building.jpg',
    'Lancaster University': 'https://www.lancaster.ac.uk/media/lancaster-university/content-assets/images/homepage/campus-aerial-view.jpg',
    'University of York': 'https://www.york.ac.uk/media/study/undergraduate/campus/heslington-east-campus.jpg',
    'University of Bath': 'https://www.bath.ac.uk/images/homepage/campus-aerial-view.jpg',
    'University of Exeter': 'https://www.exeter.ac.uk/media/universityofexeter/webteam/shared/images/homepage/forum-building.jpg',
    'Loughborough University': 'https://www.lboro.ac.uk/media/media/wwwlboroacuk/content/images/homepage/campus-aerial.jpg',
    'University of Surrey': 'https://www.surrey.ac.uk/sites/default/files/styles/hero_image/public/2019-09/campus-aerial-view.jpg',
    'University of Sussex': 'https://www.sussex.ac.uk/webteam/gateway/file.php?name=campus-aerial-view.jpg&site=25',
    'Trinity College Dublin': 'https://www.tcd.ie/visitors/assets/images/trinity-college-dublin-campus.jpg',

    // Canadian Universities
    'University of Toronto': 'https://d3d0lqu00lnqvz.cloudfront.net/media/media/UofT_cmh2315fl.jpg',
    'University of British Columbia': 'https://stubard.com/wp-content/uploads/2025/02/University-of-British-Columbia-1200x900.jpg',
    'McGill University': 'https://www.mcgill.ca/channels/files/channels/styles/wysiwyg_large/public/mcgill_roddick_gates_autumn_2019_1.jpg',
    'University of Waterloo': 'https://www.applyboard.com/_next/image?url=https%3A%2F%2Fphotos.applyboard.com%2Fschool_photos%2F000%2F014%2F138%2Fphotos%2Foptimized%2FUniversity-of-Waterloo-Campus-Aerial-July2020.webp%3F1659723993&w=3840&q=75',
    'University of Alberta': 'https://assets.studies-overseas.com/University_of_Alberta_Desktop_984x398_Header_Banner_db909e6770.webp',
    'McMaster University': 'https://stubard.com/wp-content/uploads/2025/02/McMaster-University-1.jpg',
    'Queen\'s University': 'https://www.queensu.ca/gazette/sites/default/files/assets/images/stories/2019/grant-hall-autumn.jpg',
    'University of Calgary': 'https://www.ucalgary.ca/sites/default/files/styles/ucws_image_desktop/public/2019-09/campus-aerial-view.jpg',
    'Western University': 'https://www.uwo.ca/img/homepage/campus-aerial-view.jpg',
    'Simon Fraser University': 'https://www.sfu.ca/content/sfu/sfunews/jcr:content/main_content/image.img.2000.high.jpg/1234567890123.jpg',
    'University of Victoria': 'https://www.uvic.ca/home/assets/images/campus-aerial-view.jpg',
    'Dalhousie University': 'https://www.dal.ca/content/dam/dalhousie/images/homepage/studley-campus-aerial.jpg',
    'University of Ottawa': 'https://www.uottawa.ca/sites/default/files/styles/hero_image/public/2019-10/tabaret-hall-autumn.jpg',
    'Carleton University': 'https://carleton.ca/sites/default/files/styles/hero_image/public/2019-09/campus-aerial-view.jpg',
    'York University': 'https://www.yorku.ca/wp-content/uploads/2019/09/keele-campus-aerial.jpg',

    // Australian Universities
    'University of Melbourne': 'https://static.sliit.lk/wp-content/uploads/2024/10/28052224/University-of-Melbourne.jpg',
    'Australian National University': 'https://www.anao.gov.au/sites/default/files/styles/anao_report/public/anao_report/image/anu-governance-control-frameworks-anao.jpg?itok=SLiFVAIP',
    'University of Sydney': 'https://images.shiksha.com/mediadata/images/1515481785phpZsgL9D_g.png',
    'University of Queensland': 'https://australianuniversities.click/wp-content/uploads/university-of-queensland-logo-st-lucia-feature.jpg',
    'Monash University': 'https://www.monash.edu/__data/assets/image/0009/959499/clayton-campus-students-walk-green-chemical-futures-building-2015.jpg',
    'University of New South Wales': 'https://www.unsw.edu.au/content/dam/images/homepage/campus-aerial-view.jpg',
    'University of Adelaide': 'https://www.adelaide.edu.au/sites/default/files/styles/hero_image/public/2019-09/north-terrace-campus.jpg',
    'University of Western Australia': 'https://www.uwa.edu.au/home/-/media/Project/UWA/UWA/Images/Homepage/winthrop-hall.jpg',
    'Queensland University of Technology': 'https://www.qut.edu.au/__data/assets/image/0008/123456/gardens-point-campus.jpg',
    'University of Technology Sydney': 'https://www.uts.edu.au/sites/default/files/styles/hero_image/public/2019-09/uts-tower-building.jpg',
    'RMIT University': 'https://www.rmit.edu.au/content/dam/rmit/images/homepage/city-campus-aerial.jpg',
    'Griffith University': 'https://www.griffith.edu.au/__data/assets/image/0008/123456/nathan-campus-aerial.jpg',
    'Macquarie University': 'https://www.mq.edu.au/about/campus-and-facilities/images/campus-aerial-view.jpg',
    'University of Wollongong': 'https://www.uow.edu.au/content/dam/uow/images/homepage/campus-aerial-view.jpg',
    'Curtin University': 'https://www.curtin.edu.au/sites/default/files/styles/hero_image/public/2019-09/bentley-campus-aerial.jpg',
    'Deakin University': 'https://www.deakin.edu.au/sites/default/files/styles/hero_image/public/2019-09/burwood-campus-aerial.jpg',

    // German Universities
    'Technical University of Munich': 'https://images.shiksha.com/mediadata/images/1533559592phpsYF8Oy.jpeg',
    'Ludwig Maximilian University': 'https://image-static.collegedunia.com/public/college_data/images/studyabroad/appImage/college_690_14-16:11_cov.jpeg?h=185&w=375&mode=stretch',
    'University of Munich': 'https://image-static.collegedunia.com/public/college_data/images/studyabroad/appImage/college_690_14-16:11_cov.jpeg?h=185&w=375&mode=stretch',
    'Heidelberg University': 'https://d162s0cet9s8p8.cloudfront.net/college_profile_header/216_heidelberg_header.jpg',
    'University of Heidelberg': 'https://d162s0cet9s8p8.cloudfront.net/college_profile_header/216_heidelberg_header.jpg',
    'Humboldt University': 'https://images.shiksha.com/mediadata/images/1534925114phpHWONUz.jpeg',
    'RWTH Aachen University': 'https://www.rwth-aachen.de/global/show_picture.asp?id=aaaaaaaaaadpbhq',
    'University of Göttingen': 'https://www.uni-goettingen.de/en/document/download/bed2c5c1c5b1c5c1c5b1c5c1c5b1c5c1.jpg',
    'University of Freiburg': 'https://www.uni-freiburg.de/universitaet/portrait/campus/bilder/kollegiengebaeude-i.jpg',
    'University of Cologne': 'https://www.uni-koeln.de/sites/uni_koeln/user_upload/images/campus/hauptgebaeude.jpg',
    'Dresden University of Technology': 'https://tu-dresden.de/++resource++plone.app.theming.interfaces.IThemeSettings.logo/@@images/image',
    'University of Mannheim': 'https://www.uni-mannheim.de/media/Einrichtungen/Universitaet/Portraet/Campus/schloss_luftbild.jpg',
    'Karlsruhe Institute of Technology': 'https://www.kit.edu/img/pi_2019_137_campus-sued-luftbild.jpg',

    // French Universities
    'Sorbonne University': 'https://www.sorbonne-universite.fr/sites/default/files/styles/hero_image/public/2019-09/sorbonne-facade.jpg',
    'École Polytechnique': 'https://www.polytechnique.edu/sites/default/files/styles/hero_image/public/2019-09/campus-aerial-view.jpg',
    'École Normale Supérieure': 'https://www.ens.psl.eu/sites/default/files/styles/hero_image/public/2019-09/ens-ulm-facade.jpg',
    'Sciences Po': 'https://www.sciencespo.fr/sites/default/files/styles/hero_image/public/2019-09/sciences-po-paris.jpg',
    'University of Strasbourg': 'https://www.unistra.fr/fileadmin/templates/unistra/images/palais-universitaire.jpg',
    'Grenoble Alpes University': 'https://www.univ-grenoble-alpes.fr/medias/photo/campus-aerial-view_1234567890123.jpg',
    'École Normale Supérieure de Lyon': 'https://www.ens-lyon.fr/sites/default/files/styles/hero_image/public/2019-09/ens-lyon-campus.jpg',

    // Swiss Universities
    'ETH Zurich': 'https://ethz.ch/content/dam/ethz/main/campus/ETH_Zentrum_Luftaufnahme.jpg',
    'University of Zurich': 'https://www.uzh.ch/cmsssl/dam/jcr:12345678-1234-1234-1234-123456789012/uzh-main-building.jpg',
    'University of Geneva': 'https://www.unige.ch/communication/files/1234567890123/uni-bastions.jpg',
    'University of Basel': 'https://www.unibas.ch/dam/jcr:12345678-1234-1234-1234-123456789012/kollegienhaus.jpg',
    'University of Bern': 'https://www.unibe.ch/unibe/portal/content/e12345/e67890/hauptgebaeude.jpg',
    'University of Lausanne': 'https://www.unil.ch/central/files/live/sites/central/files/images/campus-aerial.jpg',
    'University of St Gallen': 'https://www.unisg.ch/~/media/internet/content/dateien/universitaet/campus/campus-aerial.jpg',

    // Dutch Universities
    'University of Amsterdam': 'https://www.uva.nl/binaries/content/gallery/uva-nl/shared-content/locaties/roeterseilandcampus/uva-roeterseiland-campus.jpg',
    'Delft University of Technology': 'https://www.tudelft.nl/sites/default/files/styles/hero_image/public/2019-09/campus-aerial-view.jpg',
    'Eindhoven University of Technology': 'https://www.tue.nl/en/university/about-the-university/campus/images/campus-aerial-view.jpg',
    'Utrecht University': 'https://www.uu.nl/sites/default/files/styles/hero_image/public/2019-09/dom-tower-campus.jpg',
    'Leiden University': 'https://www.universiteitleiden.nl/binaries/content/gallery/ul2/main/images/campus/academy-building.jpg',
    'University of Groningen': 'https://www.rug.nl/about-ug/images/academy-building-groningen.jpg',
    'Erasmus University Rotterdam': 'https://www.eur.nl/sites/corporate/files/styles/hero_image/public/2019-09/campus-woudestein.jpg',
    'Wageningen University': 'https://www.wur.nl/upload_mm/0/1/2/12345678-1234-1234-1234-123456789012_campus-aerial.jpg',
    'Maastricht University': 'https://www.maastrichtuniversity.nl/sites/default/files/styles/hero_image/public/2019-09/inner-city-campus.jpg',
    'University of Twente': 'https://www.utwente.nl/en/organisation/about-the-university/campus/images/campus-aerial-view.jpg',
    'Tilburg University': 'https://www.tilburguniversity.edu/sites/default/files/styles/hero_image/public/2019-09/campus-aerial-view.jpg',
    'VU Amsterdam': 'https://vu.nl/nl/Images/VU_campus_tcm289-123456.jpg',
    'Radboud University': 'https://www.ru.nl/publish/pages/123456/campus-aerial-view.jpg',

    // Nordic Universities
    'University of Copenhagen': 'https://www.ku.dk/english/about/images/south-campus-aerial.jpg',
    'Technical University of Denmark': 'https://www.dtu.dk/english/about/campus/images/lyngby-campus-aerial.jpg',
    'Aarhus University': 'https://www.au.dk/en/about/images/campus-aerial-view.jpg',
    'University of Southern Denmark': 'https://www.sdu.dk/en/om_sdu/campusser/odense/images/campus-aerial.jpg',
    'KTH Royal Institute of Technology': 'https://www.kth.se/files/thumbnail/12345678901234567890123456789012',
    'Stockholm University': 'https://www.su.se/polopoly_fs/1.123456.1234567890!/image/campus-aerial.jpg',
    'Lund University': 'https://www.lunduniversity.lu.se/sites/www.lunduniversity.lu.se/files/styles/hero_image/public/2019-09/lund-university-main-building.jpg',
    'University of Gothenburg': 'https://www.gu.se/sites/default/files/styles/hero_image/public/2019-09/campus-aerial-view.jpg',
    'Chalmers University of Technology': 'https://www.chalmers.se/en/about-chalmers/Images/campus-johanneberg-aerial.jpg',
    'Linköping University': 'https://liu.se/en/about-liu/campus/images/campus-valla-aerial.jpg',
    'Umeå University': 'https://www.umu.se/en/about-umu/campus/images/campus-aerial-view.jpg',
    'University of Oslo': 'https://www.uio.no/english/about/facts/images/blindern-campus-aerial.jpg',
    'Norwegian University of Science and Technology': 'https://www.ntnu.edu/images/campus/gloeshaugen-campus-aerial.jpg',
    'University of Bergen': 'https://www.uib.no/en/about/campus/images/campus-aerial-view.jpg',
    'University of Helsinki': 'https://www.helsinki.fi/en/about-us/campuses-and-locations/images/city-centre-campus.jpg',
    'Aalto University': 'https://www.aalto.fi/sites/g/files/flghsv161/files/styles/hero_image/public/2019-09/otaniemi-campus-aerial.jpg',
    'University of Turku': 'https://www.utu.fi/en/about-us/campuses/images/turku-campus-aerial.jpg',
    'University of Oulu': 'https://www.oulu.fi/university/images/linnanmaa-campus-aerial.jpg',
    'University of Jyväskylä': 'https://www.jyu.fi/en/university/images/campus-aerial-view.jpg',
    'University of Iceland': 'https://english.hi.is/university/images/campus-aerial-view.jpg',

    // Asian Universities
    'University of Tokyo': 'https://www.u-tokyo.ac.jp/en/about/images/hongo-campus-yasuda-auditorium.jpg',
    'Kyoto University': 'https://www.kyoto-u.ac.jp/en/about/images/yoshida-campus-clock-tower.jpg',
    'Osaka University': 'https://www.osaka-u.ac.jp/en/about/images/suita-campus-aerial.jpg',
    'Tokyo Institute of Technology': 'https://www.titech.ac.jp/english/about/images/ookayama-campus-main-building.jpg',
    'Tohoku University': 'https://www.tohoku.ac.jp/en/about/images/kawauchi-campus-aerial.jpg',
    'Nagoya University': 'https://en.nagoya-u.ac.jp/about_nu/images/higashiyama-campus-aerial.jpg',
    'Hokkaido University': 'https://www.hokudai.ac.jp/en/about/images/sapporo-campus-main-building.jpg',
    'Kyushu University': 'https://www.kyushu-u.ac.jp/en/about/images/ito-campus-aerial.jpg',
    'Waseda University': 'https://www.waseda.jp/top/en/about/images/waseda-campus-okuma-auditorium.jpg',
    'Keio University': 'https://www.keio.ac.jp/en/about/images/mita-campus-main-building.jpg',
    'Ritsumeikan University': 'https://en.ritsumei.ac.jp/about/images/kinugasa-campus-aerial.jpg',
    'Sophia University': 'https://www.sophia.ac.jp/eng/aboutsophia/images/yotsuya-campus-main-building.jpg',
    'Kobe University': 'https://www.kobe-u.ac.jp/en/about/images/rokkodai-campus-aerial.jpg',
    'Hiroshima University': 'https://www.hiroshima-u.ac.jp/en/about/images/higashihiroshima-campus-aerial.jpg',

    // Chinese Universities
    'Peking University': 'https://english.pku.edu.cn/images/content/2019-09/20190901234567.jpg',
    'Tsinghua University': 'https://www.tsinghua.edu.cn/en/images/content/2019-09/tsinghua-main-building.jpg',
    'Fudan University': 'https://www.fudan.edu.cn/en/images/content/2019-09/handan-campus-main-building.jpg',
    'Shanghai Jiao Tong University': 'https://en.sjtu.edu.cn/images/content/2019-09/minhang-campus-aerial.jpg',
    'University of Science and Technology of China': 'https://en.ustc.edu.cn/images/content/2019-09/campus-aerial-view.jpg',
    'Zhejiang University': 'https://www.zju.edu.cn/english/images/content/2019-09/zijingang-campus-aerial.jpg',
    'Nanjing University': 'https://www.nju.edu.cn/EN/images/content/2019-09/gulou-campus-main-building.jpg',
    'Wuhan University': 'https://en.whu.edu.cn/images/content/2019-09/luojia-hill-campus.jpg',
    'Harbin Institute of Technology': 'https://en.hit.edu.cn/images/content/2019-09/campus-main-building.jpg',
    'Beihang University': 'https://ev.buaa.edu.cn/images/content/2019-09/xueyuan-campus-aerial.jpg',
    'Tongji University': 'https://en.tongji.edu.cn/images/content/2019-09/siping-campus-aerial.jpg',
    'Beijing Normal University': 'https://english.bnu.edu.cn/images/content/2019-09/haidian-campus-main-building.jpg',
    'Sun Yat-sen University': 'https://www.sysu.edu.cn/en/images/content/2019-09/guangzhou-campus-aerial.jpg',
    'Xi\'an Jiaotong University': 'https://en.xjtu.edu.cn/images/content/2019-09/xingqing-campus-main-building.jpg',
    'Tianjin University': 'https://www.tju.edu.cn/english/images/content/2019-09/weijin-campus-main-building.jpg',
    'Sichuan University': 'https://en.scu.edu.cn/images/content/2019-09/wangjiang-campus-aerial.jpg',
    'Xiamen University': 'https://en.xmu.edu.cn/images/content/2019-09/siming-campus-aerial.jpg',
    'Huazhong University of Science and Technology': 'https://english.hust.edu.cn/images/content/2019-09/main-campus-aerial.jpg',
    'Nanjing University of Science and Technology': 'https://en.njust.edu.cn/images/content/2019-09/campus-main-building.jpg',

    // Korean Universities
    'Seoul National University': 'https://en.snu.ac.kr/images/content/2019-09/gwanak-campus-main-building.jpg',
    'KAIST': 'https://www.kaist.ac.kr/en/images/content/2019-09/daejeon-campus-aerial.jpg',
    'Korea Advanced Institute of Science and Technology': 'https://www.kaist.ac.kr/en/images/content/2019-09/daejeon-campus-aerial.jpg',
    'POSTECH': 'https://www.postech.ac.kr/eng/images/content/2019-09/pohang-campus-aerial.jpg',
    'Yonsei University': 'https://www.yonsei.ac.kr/en/images/content/2019-09/sinchon-campus-main-building.jpg',
    'Korea University': 'https://www.korea.edu/sites/default/files/styles/hero_image/public/2019-09/anam-campus-main-building.jpg',
    'Sungkyunkwan University': 'https://www.skku.edu/eng/images/content/2019-09/humanities-campus-main-building.jpg',
    'Hanyang University': 'https://www.hanyang.ac.kr/english/images/content/2019-09/seoul-campus-main-building.jpg',
    'Kyung Hee University': 'https://www.khu.ac.kr/eng/images/content/2019-09/seoul-campus-main-building.jpg',
    'Ewha Womans University': 'https://www.ewha.ac.kr/ewhaen/images/content/2019-09/campus-main-building.jpg',
    'Chung-Ang University': 'https://neweng.cau.ac.kr/images/content/2019-09/seoul-campus-main-building.jpg',
    'Pusan National University': 'https://www.pusan.ac.kr/eng/images/content/2019-09/busan-campus-aerial.jpg',

    // Indian Universities
    'Indian Institute of Technology Delhi': 'https://home.iitd.ac.in/images/content/2019-09/main-building-aerial.jpg',
    'Indian Institute of Technology Bombay': 'https://www.iitb.ac.in/images/content/2019-09/powai-campus-aerial.jpg',
    'Indian Institute of Technology Kanpur': 'https://www.iitk.ac.in/images/content/2019-09/campus-aerial-view.jpg',
    'Indian Institute of Technology Madras': 'https://www.iitm.ac.in/images/content/2019-09/campus-main-building.jpg',
    'Indian Institute of Technology Kharagpur': 'https://www.iitkgp.ac.in/images/content/2019-09/campus-main-building.jpg',
    'Indian Institute of Technology Roorkee': 'https://www.iitr.ac.in/images/content/2019-09/main-building-thomason.jpg',
    'Indian Institute of Technology Guwahati': 'https://www.iitg.ac.in/images/content/2019-09/campus-aerial-view.jpg',
    'Indian Institute of Technology Hyderabad': 'https://www.iith.ac.in/images/content/2019-09/campus-main-building.jpg',
    'Indian Institute of Technology Indore': 'https://www.iiti.ac.in/images/content/2019-09/campus-aerial-view.jpg',
    'Indian Institute of Technology Bhubaneswar': 'https://www.iitbbs.ac.in/images/content/2019-09/campus-main-building.jpg',
    'Indian Institute of Technology Gandhinagar': 'https://www.iitgn.ac.in/images/content/2019-09/campus-aerial-view.jpg',
    'Indian Institute of Technology Jodhpur': 'https://www.iitj.ac.in/images/content/2019-09/campus-main-building.jpg',
    'Indian Institute of Science': 'https://www.iisc.ac.in/images/content/2019-09/campus-main-building.jpg',
    'Birla Institute of Technology and Science Pilani': 'https://www.bits-pilani.ac.in/images/content/2019-09/pilani-campus-main-building.jpg',
    'Vellore Institute of Technology': 'https://vit.ac.in/images/content/2019-09/vellore-campus-aerial.jpg',
    'Manipal Academy of Higher Education': 'https://manipal.edu/images/content/2019-09/manipal-campus-aerial.jpg',
    'Amity University': 'https://www.amity.edu/images/content/2019-09/noida-campus-aerial.jpg',
    'SRM Institute of Science and Technology': 'https://www.srmist.edu.in/images/content/2019-09/kattankulathur-campus-aerial.jpg',
    'Jawaharlal Nehru University': 'https://www.jnu.ac.in/images/content/2019-09/campus-main-building.jpg',
    'University of Delhi': 'https://www.du.ac.in/images/content/2019-09/north-campus-main-building.jpg',
    'Anna University': 'https://www.annauniv.edu/images/content/2019-09/guindy-campus-main-building.jpg',
    'Jadavpur University': 'https://www.jaduniv.edu.in/images/content/2019-09/campus-main-building.jpg',

    // Singapore Universities
    'National University of Singapore': 'https://www.nus.edu.sg/images/content/2019-09/kent-ridge-campus-aerial.jpg',
    'Nanyang Technological University': 'https://www.ntu.edu.sg/images/content/2019-09/yunnan-garden-campus-aerial.jpg',
    'Nanyang Technological University Singapore': 'https://www.ntu.edu.sg/images/content/2019-09/yunnan-garden-campus-aerial.jpg',
    'Singapore Management University': 'https://www.smu.edu.sg/images/content/2019-09/city-campus-main-building.jpg',

    // Hong Kong Universities
    'University of Hong Kong': 'https://www.hku.hk/images/content/2019-09/main-building-centennial-campus.jpg',
    'Hong Kong University of Science and Technology': 'https://www.ust.hk/images/content/2019-09/clear-water-bay-campus-aerial.jpg',
    'Chinese University of Hong Kong': 'https://www.cuhk.edu.hk/images/content/2019-09/shatin-campus-aerial.jpg',
    'City University of Hong Kong': 'https://www.cityu.edu.hk/images/content/2019-09/kowloon-tong-campus-main-building.jpg',
    'Hong Kong Polytechnic University': 'https://www.polyu.edu.hk/images/content/2019-09/hung-hom-campus-main-building.jpg',

    // New Zealand Universities
    'University of Auckland': 'https://www.auckland.ac.nz/content/dam/uoa/images/homepage/city-campus-clock-tower.jpg',
    'University of Otago': 'https://www.otago.ac.nz/images/content/2019-09/dunedin-campus-clocktower.jpg',
    'Victoria University of Wellington': 'https://www.wgtn.ac.nz/images/content/2019-09/kelburn-campus-hunter-building.jpg',
    'University of Canterbury': 'https://www.canterbury.ac.nz/images/content/2019-09/ilam-campus-aerial.jpg',

    // Malaysian Universities
    'University of Malaya': 'https://www.um.edu.my/images/content/2019-09/um-main-building-aerial.jpg',
    'Universiti Putra Malaysia': 'https://www.upm.edu.my/images/content/2019-09/upm-campus-aerial.jpg',
    'Universiti Kebangsaan Malaysia': 'https://www.ukm.my/portal/images/content/2019-09/ukm-campus-main.jpg',
    'Universiti Teknologi Malaysia': 'https://www.utm.my/images/content/2019-09/utm-skudai-campus-aerial.jpg',
    'Universiti Sains Malaysia': 'https://www.usm.my/images/content/2019-09/usm-main-campus-aerial.jpg',

    // Thai Universities
    'Chulalongkorn University': 'https://www.chula.ac.th/en/images/content/2019-09/chula-main-building.jpg',
    'Mahidol University': 'https://mahidol.ac.th/en/images/content/2019-09/salaya-campus-aerial.jpg',
    'King Mongkut\'s University of Technology Thonburi': 'https://www.kmutt.ac.th/en/images/content/2019-09/bangmod-campus-aerial.jpg',
    'Thammasat University': 'https://www.tu.ac.th/en/images/content/2019-09/tha-prachan-campus.jpg',

    // Indonesian Universities
    'University of Indonesia': 'https://www.ui.ac.id/en/images/content/2019-09/depok-campus-aerial.jpg',
    'Bandung Institute of Technology': 'https://www.itb.ac.id/images/content/2019-09/ganesha-campus-main.jpg',
    'Gadjah Mada University': 'https://ugm.ac.id/en/images/content/2019-09/bulaksumur-campus-aerial.jpg',

    // Philippine Universities
    'University of the Philippines': 'https://www.up.edu.ph/images/content/2019-09/diliman-campus-oblation.jpg',
    'Ateneo de Manila University': 'https://www.ateneo.edu/images/content/2019-09/loyola-heights-campus.jpg',
    'De La Salle University': 'https://www.dlsu.edu.ph/images/content/2019-09/taft-campus-main.jpg',

    // Taiwan Universities
    'National Taiwan University': 'https://www.ntu.edu.tw/english/images/content/2019-09/main-campus-palm-boulevard.jpg',
    'National Tsing Hua University': 'https://www.nthu.edu.tw/en/images/content/2019-09/tsing-hua-lake-campus.jpg',
    'National Chiao Tung University': 'https://www.nctu.edu.tw/en/images/content/2019-09/guangfu-campus-main.jpg',
    'National Cheng Kung University': 'https://web.ncku.edu.tw/en/images/content/2019-09/kuang-fu-campus-aerial.jpg',

    // Vietnamese Universities
    'Vietnam National University Hanoi': 'https://vnu.edu.vn/eng/images/content/2019-09/hanoi-campus-main.jpg',

    // Latin American Universities
    'University of São Paulo': 'https://www5.usp.br/english/wp-content/uploads/sites/11/2019/09/usp-main-campus-aerial.jpg',
    'State University of Campinas': 'https://www.unicamp.br/unicamp/images/content/2019-09/campinas-campus-aerial.jpg',
    'Federal University of Rio de Janeiro': 'https://ufrj.br/en/images/content/2019-09/cidade-universitaria-aerial.jpg',
    'National Autonomous University of Mexico': 'https://www.unam.mx/images/content/2019-09/ciudad-universitaria-aerial.jpg',
    'Monterrey Institute of Technology': 'https://tec.mx/en/images/content/2019-09/monterrey-campus-main.jpg',
    'Tecnológico de Monterrey': 'https://tec.mx/en/images/content/2019-09/monterrey-campus-main.jpg',
    'Pontifical Catholic University of Chile': 'https://www.uc.cl/en/images/content/2019-09/san-joaquin-campus-aerial.jpg',
    'University of Chile': 'https://www.uchile.cl/english/images/content/2019-09/beauchef-campus-main.jpg',
    'University of Buenos Aires': 'https://www.uba.ar/images/content/2019-09/ciudad-universitaria-aerial.jpg',
    'University of the Andes Colombia': 'https://uniandes.edu.co/en/images/content/2019-09/bogota-campus-aerial.jpg',
    'Universidad de los Andes': 'https://uniandes.edu.co/en/images/content/2019-09/bogota-campus-aerial.jpg',
    'National University of Colombia': 'https://unal.edu.co/en/images/content/2019-09/bogota-campus-main.jpg',
    'Pontifical Catholic University of Peru': 'https://www.pucp.edu.pe/en/images/content/2019-09/san-miguel-campus-aerial.jpg',
    'University of Costa Rica': 'https://www.ucr.ac.cr/images/content/2019-09/san-pedro-campus-main.jpg',

    // Middle Eastern Universities
    'King Abdullah University of Science and Technology': 'https://www.kaust.edu.sa/en/images/content/2019-09/thuwal-campus-aerial.jpg',
    'King Fahd University of Petroleum and Minerals': 'https://www.kfupm.edu.sa/en/images/content/2019-09/dhahran-campus-aerial.jpg',
    'King Saud University': 'https://ksu.edu.sa/en/images/content/2019-09/riyadh-campus-main.jpg',
    'Qatar University': 'https://www.qu.edu.qa/images/content/2019-09/doha-campus-aerial.jpg',
    'Khalifa University': 'https://www.ku.ac.ae/images/content/2019-09/abu-dhabi-campus-aerial.jpg',
    'American University of Sharjah': 'https://www.aus.edu/images/content/2019-09/sharjah-campus-main.jpg',
    'United Arab Emirates University': 'https://www.uaeu.ac.ae/en/images/content/2019-09/al-ain-campus-aerial.jpg',
    'Technion - Israel Institute of Technology': 'https://www.technion.ac.il/en/images/content/2019-09/haifa-campus-aerial.jpg',
    'Tel Aviv University': 'https://english.tau.ac.il/images/content/2019-09/ramat-aviv-campus-aerial.jpg',
    'Hebrew University of Jerusalem': 'https://new.huji.ac.il/en/images/content/2019-09/mount-scopus-campus.jpg',
    'Koç University': 'https://www.ku.edu.tr/en/images/content/2019-09/sariyer-campus-aerial.jpg',
    'Sabancı University': 'https://www.sabanciuniv.edu/en/images/content/2019-09/tuzla-campus-aerial.jpg',
    'Boğaziçi University': 'https://www.boun.edu.tr/en-US/images/content/2019-09/bebek-campus-bosphorus.jpg',
    'Middle East Technical University': 'https://www.metu.edu.tr/images/content/2019-09/ankara-campus-aerial.jpg',
    'American University in Cairo': 'https://www.aucegypt.edu/images/content/2019-09/new-cairo-campus-aerial.jpg',
    'Cairo University': 'https://cu.edu.eg/en/images/content/2019-09/giza-campus-main.jpg',
    'American University of Beirut': 'https://www.aub.edu.lb/images/content/2019-09/beirut-campus-main-gate.jpg',
    'Lebanese American University': 'https://www.lau.edu.lb/images/content/2019-09/beirut-campus-main.jpg',
    'Jordan University of Science and Technology': 'https://www.just.edu.jo/en/images/content/2019-09/irbid-campus-aerial.jpg',
    'University of Jordan': 'https://ju.edu.jo/en/images/content/2019-09/amman-campus-main.jpg',

    // South African Universities
    'University of Cape Town': 'https://www.uct.ac.za/images/content/2019-09/upper-campus-table-mountain.jpg',
    'University of the Witwatersrand': 'https://www.wits.ac.za/images/content/2019-09/braamfontein-campus-aerial.jpg',
    'Stellenbosch University': 'https://www.sun.ac.za/english/images/content/2019-09/stellenbosch-campus-main.jpg',

    // More Italian Universities
    'Sapienza University of Rome': 'https://www.uniroma1.it/en/images/content/2019-09/citta-universitaria-aerial.jpg',
    'University of Padua': 'https://www.unipd.it/en/images/content/2019-09/palazzo-bo-main.jpg',
    'University of Pisa': 'https://www.unipi.it/images/content/2019-09/pisa-campus-leaning-tower.jpg',
    'Politecnico di Torino': 'https://www.polito.it/en/images/content/2019-09/castello-valentino-campus.jpg',
    'University of Florence': 'https://www.unifi.it/images/content/2019-09/piazza-san-marco-campus.jpg',
    'University of Rome Tor Vergata': 'https://web.uniroma2.it/en/images/content/2019-09/tor-vergata-campus-aerial.jpg',
    'University of Genoa': 'https://unige.it/en/images/content/2019-09/genoa-campus-main.jpg',
    'University of Naples Federico II': 'https://www.unina.it/en/images/content/2019-09/monte-sant-angelo-campus.jpg',

    // More Spanish Universities
    'Autonomous University of Madrid': 'https://www.uam.es/uam/en/images/content/2019-09/cantoblanco-campus-aerial.jpg',
    'Pompeu Fabra University': 'https://www.upf.edu/en/images/content/2019-09/ciutadella-campus-main.jpg',
    'University of Valencia': 'https://www.uv.es/uvweb/en/images/content/2019-09/burjassot-campus-aerial.jpg',
    'University of Seville': 'https://www.us.es/eng/images/content/2019-09/reina-mercedes-campus.jpg',
    'University of Zaragoza': 'https://www.unizar.es/en/images/content/2019-09/-francisco-campus.jpg',
    'University of Granada': 'https://www.ugr.es/en/images/content/2019-09/fuentenueva-campus-sierra-nevada.jpg',

    // More Portuguese Universities
    'University of Coimbra': 'https://www.uc.pt/en/images/content/2019-09/alta-university-tower.jpg',
    'NOVA University Lisbon': 'https://www.unl.pt/en/images/content/2019-09/campolide-campus-main.jpg',

    // More Polish Universities
    'University of Wrocław': 'https://uni.wroc.pl/en/images/content/2019-09/main-building-odra-river.jpg',
    'AGH University of Science and Technology': 'https://www.agh.edu.pl/en/images/content/2019-09/krakow-campus-main.jpg',

    // More Czech Universities
    'Masaryk University': 'https://www.muni.cz/en/images/content/2019-09/brno-campus-main.jpg',
    'Czech Technical University in Prague': 'https://www.cvut.cz/en/images/content/2019-09/dejvice-campus-main.jpg',

    // More Hungarian Universities
    'Budapest University of Technology and Economics': 'https://www.bme.hu/en/images/content/2019-09/budapest-campus-danube.jpg',
    'University of Debrecen': 'https://unideb.hu/en/images/content/2019-09/debrecen-campus-main.jpg',

    // More Belgian Universities
    'University of Antwerp': 'https://www.uantwerpen.be/en/images/content/2019-09/campus-drie-eiken-aerial.jpg',
    'Vrije Universiteit Brussel': 'https://www.vub.be/en/images/content/2019-09/etterbeek-campus-main.jpg',

    // More Austrian Universities
    'University of Innsbruck': 'https://www.uibk.ac.at/images/content/2019-09/innsbruck-campus-mountains.jpg',
    'Graz University of Technology': 'https://www.tugraz.at/en/images/content/2019-09/alte-technik-main-building.jpg',

    // More Swiss Universities
    'University of Neuchâtel': 'https://www.unine.ch/images/content/2019-09/neuchatel-campus-lake.jpg',
    'University of Fribourg': 'https://www.unifr.ch/home/en/images/content/2019-09/miséricorde-campus-main.jpg',

    // Greek Universities
    'National Technical University of Athens': 'https://www.ntua.gr/en/images/content/2019-09/zografou-campus-main.jpg',
    'Aristotle University of Thessaloniki': 'https://www.auth.gr/en/images/content/2019-09/thessaloniki-campus-aerial.jpg',

    // Romanian Universities
    'University of Bucharest': 'https://unibuc.ro/en/images/content/2019-09/bucharest-campus-main.jpg',

    // Bulgarian Universities
    'Sofia University': 'https://www.uni-sofia.bg/eng/images/content/2019-09/sofia-campus-main.jpg',

    // Russian Universities
    'Lomonosov Moscow State University': 'https://www.msu.ru/en/images/content/2019-09/sparrow-hills-main-building.jpg',
    'Saint Petersburg State University': 'https://english.spbu.ru/images/content/2019-09/vasilievsky-island-campus.jpg',

    // More Scandinavian Universities
    'University of Luxembourg': 'https://wwwen.uni.lu/images/content/2019-09/belval-campus-main.jpg',
    'University of Malta': 'https://www.um.edu.mt/images/content/2019-09/msida-campus-aerial.jpg',
    'University of Cyprus': 'https://www.ucy.ac.cy/en/images/content/2019-09/nicosia-campus-main.jpg',

    // Default fallback images by country
    'United States': 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=400&h=200&fit=crop',
    'United Kingdom': 'https://images.unsplash.com/photo-1520637836862-4d197d17c90a?w=400&h=200&fit=crop',
    'Canada': 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=200&fit=crop',
    'Australia': 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=200&fit=crop',
    'Germany': 'https://images.unsplash.com/photo-1562774053-e08756dedf3f?w=400&h=200&fit=crop',
    'France': 'https://images.unsplash.com/photo-1502602898536-47ad22581b52?w=400&h=200&fit=crop',
    'Netherlands': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=200&fit=crop',
    'Switzerland': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
    'Sweden': 'https://images.unsplash.com/photo-1509356843151-3e7d96241e11?w=400&h=200&fit=crop',
    'Norway': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=400&h=200&fit=crop',
    'Denmark': 'https://images.unsplash.com/photo-1513622470522-26c3c8a854bc?w=400&h=200&fit=crop',
    'Finland': 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=200&fit=crop',
    'Japan': 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=400&h=200&fit=crop',
    'South Korea': 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&h=200&fit=crop',
    'China': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=200&fit=crop',
    'Singapore': 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?w=400&h=200&fit=crop',
    'Hong Kong': 'https://images.unsplash.com/photo-1536599018102-9f803c140fc1?w=400&h=200&fit=crop',
    'India': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=400&h=200&fit=crop',
    'Brazil': 'https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=400&h=200&fit=crop',
    'Mexico': 'https://images.unsplash.com/photo-1518638150340-f706e86654de?w=400&h=200&fit=crop',
    'Argentina': 'https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=400&h=200&fit=crop',
    'Chile': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=200&fit=crop',
    'Colombia': 'https://images.unsplash.com/photo-1568632234157-ce7aecd03d0d?w=400&h=200&fit=crop',
    'Peru': 'https://images.unsplash.com/photo-1526392060635-9d6019884377?w=400&h=200&fit=crop',
    'Costa Rica': 'https://images.unsplash.com/photo-1621894164952-e8e5c2e6d0e5?w=400&h=200&fit=crop',
    'Spain': 'https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=400&h=200&fit=crop',
    'Italy': 'https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=400&h=200&fit=crop',
    'Portugal': 'https://images.unsplash.com/photo-1555881400-74d7acaacd8b?w=400&h=200&fit=crop',
    'Poland': 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=400&h=200&fit=crop',
    'Czech Republic': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=200&fit=crop',
    'Hungary': 'https://images.unsplash.com/photo-1541849546-216549ae216d?w=400&h=200&fit=crop',
    'Greece': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&h=200&fit=crop',
    'Romania': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&h=200&fit=crop',
    'Bulgaria': 'https://images.unsplash.com/photo-1555993539-1732b0258235?w=400&h=200&fit=crop',
    'Russia': 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=400&h=200&fit=crop',
    'Austria': 'https://images.unsplash.com/photo-1516550893923-42d28e5677af?w=400&h=200&fit=crop',
    'Belgium': 'https://images.unsplash.com/photo-1559564484-e48bf1b6c5b5?w=400&h=200&fit=crop',
    'Ireland': 'https://images.unsplash.com/photo-1590089415225-401ed6f9db8e?w=400&h=200&fit=crop',
    'Iceland': 'https://images.unsplash.com/photo-1504829857797-ddff29c27927?w=400&h=200&fit=crop',
    'Luxembourg': 'https://images.unsplash.com/photo-1559564484-e48bf1b6c5b5?w=400&h=200&fit=crop',
    'Malta': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=200&fit=crop',
    'Cyprus': 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?w=400&h=200&fit=crop',
    'Malaysia': 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=400&h=200&fit=crop',
    'Thailand': 'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=400&h=200&fit=crop',
    'Indonesia': 'https://images.unsplash.com/photo-1555217851-6141535bd771?w=400&h=200&fit=crop',
    'Philippines': 'https://images.unsplash.com/photo-1551244072-5d12893278ab?w=400&h=200&fit=crop',
    'Vietnam': 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?w=400&h=200&fit=crop',
    'Taiwan': 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=400&h=200&fit=crop',
    'New Zealand': 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=400&h=200&fit=crop',
    'Israel': 'https://images.unsplash.com/photo-1544783287-5a2d2c0a8f87?w=400&h=200&fit=crop',
    'Turkey': 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=400&h=200&fit=crop',
    'Egypt': 'https://images.unsplash.com/photo-1572252009286-268acec5ca0a?w=400&h=200&fit=crop',
    'South Africa': 'https://images.unsplash.com/photo-1484318571209-661cf29a69c3?w=400&h=200&fit=crop',
    'Saudi Arabia': 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=400&h=200&fit=crop',
    'United Arab Emirates': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=200&fit=crop',
    'Qatar': 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=400&h=200&fit=crop',
    'Lebanon': 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=400&h=200&fit=crop',
    'Jordan': 'https://images.unsplash.com/photo-1580674285054-bed31e145f59?w=400&h=200&fit=crop'
  };

  // First try to get university-specific image
  if (universityImages[university.name]) {
    return universityImages[university.name];
  }

  // Then try country-specific image
  if (universityImages[university.country]) {
    return universityImages[university.country];
  }

  // Default fallback
  return 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=400&h=200&fit=crop';
};

// Mock components
const UniversityCard = ({ university, onClick, showBookmark, isBookmarked, onBookmarkToggle, showComparison, isSelected, onSelectionToggle }) => (
  <div style={{
    background: 'white',
    borderRadius: '15px',
    overflow: 'hidden',
    boxShadow: isSelected ? '0 8px 25px rgba(67, 97, 238, 0.3)' : '0 5px 20px rgba(0, 0, 0, 0.08)',
    border: isSelected ? '3px solid #2563eb' : 'none',
    transition: 'transform 0.3s, box-shadow 0.3s, border 0.3s',
    cursor: 'pointer',
    position: 'relative',
    transform: isSelected ? 'translateY(-2px)' : 'translateY(0)'
  }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.15)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 5px 20px rgba(0, 0, 0, 0.08)';
    }}>
    {showComparison && (
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 10,
        background: 'white',
        borderRadius: '50%',
        padding: '5px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <input
          type="checkbox"
          checked={isSelected}
          onChange={(e) => {
            e.stopPropagation();
            console.log('Toggling selection for university:', university.id, 'Currently selected:', isSelected);
            onSelectionToggle(university.id);
          }}
          style={{
            width: '20px',
            height: '20px',
            cursor: 'pointer',
            accentColor: '#2563eb',
            transform: isSelected ? 'scale(1.1)' : 'scale(1)',
            transition: 'transform 0.2s'
          }}
          title={isSelected ? 'Remove from comparison' : 'Add to comparison'}
        />
      </div>
    )}
    {showBookmark && (
      <button
        onClick={(e) => {
          e.stopPropagation();
          console.log('Bookmark button clicked for university:', university.id, 'Currently bookmarked:', isBookmarked);
          onBookmarkToggle(university.id, isBookmarked);
        }}
        style={{
          position: 'absolute',
          top: '10px',
          right: '10px',
          background: 'white',
          border: 'none',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          fontSize: '1.2rem',
          cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          zIndex: 10,
          transition: 'transform 0.2s, box-shadow 0.2s',
          transform: isBookmarked ? 'scale(1.1)' : 'scale(1)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.2)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.2)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = isBookmarked ? 'scale(1.1)' : 'scale(1)';
          e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
        }}
        title={isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}
      >
        {isBookmarked ? '❤️' : '🤍'}
      </button>
    )}
    <img
      src={getUniversityImage(university)}
      alt={university.name}
      style={{ width: '100%', height: '200px', objectFit: 'cover' }}
    />
    <div style={{ padding: '20px' }}>
      <h3 style={{ color: '#1d4ed8', marginBottom: '10px', fontSize: '1.2rem' }}>{university.name}</h3>
      <p style={{ color: '#666', fontSize: '0.9rem', marginBottom: '15px' }}>
        📍 {university.city}, {university.country}
      </p>
      <div style={{ display: 'flex', gap: '10px', marginBottom: '15px', flexWrap: 'wrap' }}>
        <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500' }}>
          🏆 #{university.ranking || 'N/A'}
        </span>
        <span style={{ background: '#fff3e0', color: '#f57c00', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem', fontWeight: '500' }}>
          💰 ${university.tuition_fee?.toLocaleString() || 'N/A'}
        </span>
      </div>
      <button
        onClick={() => onClick(university.id)}
        style={{
          width: '100%',
          padding: '10px',
          background: '#2563eb',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontWeight: '600',
          fontSize: '0.95rem'
        }}
      >
        View Details
      </button>
    </div>
  </div>
);

const LoadingSpinner = ({ size, message }) => (
  <div style={{ textAlign: 'center' }}>
    <div style={{
      border: '4px solid #f3f3f3',
      borderTop: '4px solid #2563eb',
      borderRadius: '50%',
      width: size === 'large' ? '60px' : '40px',
      height: size === 'large' ? '60px' : '40px',
      animation: 'spin 1s linear infinite',
      margin: '0 auto 1rem'
    }} />
    <p style={{ color: '#666' }}>{message}</p>
  </div>
);

function SearchPage() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedUniversities, setSelectedUniversities] = useState(new Set());
  const [sortBy, setSortBy] = useState('ranking');
  const [sortOrder, setSortOrder] = useState('asc');
  const [universities, setUniversities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookmarkedUniversities, setBookmarkedUniversities] = useState(() => {
    try {
      const saved = localStorage.getItem('bookmarkedUniversities');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch (error) {
      console.error('Error loading bookmarks:', error);
      return new Set();
    }
  });

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUniversities, setTotalUniversities] = useState(0);
  const [universitiesPerPage] = useState(12); // Show 12 universities per page

  const [filters, setFilters] = useState({
    country: [],
    tuitionMin: '',
    tuitionMax: '',
    cgpaMin: '',
    cgpaMax: '',
    type: ''
  });

  // Save bookmarks to localStorage whenever bookmarks change
  useEffect(() => {
    try {
      localStorage.setItem('bookmarkedUniversities', JSON.stringify([...bookmarkedUniversities]));
    } catch (error) {
      console.error('Error saving bookmarks:', error);
    }
  }, [bookmarkedUniversities]);

  const fetchUniversities = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        per_page: universitiesPerPage.toString()
      });

      // Add search query
      if (searchQuery.trim()) {
        params.append('q', searchQuery.trim());
      }

      // Add filters
      if (filters.country.length > 0) {
        params.append('country', filters.country.join(','));
      }
      if (filters.tuitionMin) {
        params.append('min_tuition', filters.tuitionMin);
      }
      if (filters.tuitionMax) {
        params.append('max_tuition', filters.tuitionMax);
      }
      if (filters.cgpaMin) {
        params.append('min_cgpa', filters.cgpaMin);
      }
      if (filters.cgpaMax) {
        params.append('max_cgpa', filters.cgpaMax);
      }
      if (filters.type) {
        params.append('type', filters.type);
      }

      // Add sorting
      if (sortBy) {
        params.append('sort_by', sortBy);
        params.append('sort_order', sortOrder);
      }

      const response = await fetch(`http://localhost:5000/api/universities?${params}`);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();



      if (data.success && data.data) {
        setUniversities(data.data.universities || []);

        // Get pagination info from the correct location
        const pagination = data.data.pagination || {};
        setTotalPages(pagination.pages || 1);
        setTotalUniversities(pagination.total || 0);


      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error fetching universities:', error);
      setError('Failed to load universities. Please try again.');

      // Fallback to mock data if API fails
      setUniversities([
        { id: 1, name: 'Harvard University', city: 'Cambridge', country: 'USA', ranking: 1, tuition_fee: 54000 },
        { id: 2, name: 'Oxford University', city: 'Oxford', country: 'UK', ranking: 2, tuition_fee: 35000 },
        { id: 3, name: 'Stanford University', city: 'Stanford', country: 'USA', ranking: 3, tuition_fee: 56000 },
        { id: 4, name: 'MIT', city: 'Cambridge', country: 'USA', ranking: 4, tuition_fee: 55000 },
        { id: 5, name: 'Cambridge University', city: 'Cambridge', country: 'UK', ranking: 5, tuition_fee: 34000 },
        { id: 6, name: 'Yale University', city: 'New Haven', country: 'USA', ranking: 6, tuition_fee: 57000 }
      ]);
      setTotalPages(1);
      setTotalUniversities(6);
    } finally {
      setLoading(false);
    }
  }, [currentPage, searchQuery, filters, sortBy, sortOrder, universitiesPerPage]);

  useEffect(() => {
    fetchUniversities();
  }, [fetchUniversities]);

  // Get all available countries from the database (not just from current filtered results)
  const allAvailableCountries = [
    'Argentina', 'Australia', 'Austria', 'Belgium', 'Brazil', 'Bulgaria', 'Canada', 'Chile',
    'China', 'Colombia', 'Costa Rica', 'Cyprus', 'Czech Republic', 'Denmark', 'Egypt',
    'Finland', 'France', 'Germany', 'Greece', 'Hong Kong', 'Hungary', 'Iceland', 'India',
    'Indonesia', 'Ireland', 'Israel', 'Italy', 'Japan', 'Jordan', 'Lebanon', 'Luxembourg',
    'Malaysia', 'Malta', 'Mexico', 'Netherlands', 'New Zealand', 'Norway', 'Peru',
    'Philippines', 'Poland', 'Portugal', 'Qatar', 'Romania', 'Russia', 'Saudi Arabia',
    'Singapore', 'South Africa', 'South Korea', 'Spain', 'Sweden', 'Switzerland', 'Taiwan',
    'Thailand', 'Turkey', 'United Arab Emirates', 'United Kingdom', 'United States', 'Vietnam'
  ];
  const countries = allAvailableCountries.sort();

  // Country name mapping for better display - includes all countries from universities.json
  const countryNames = {
    'AR': 'Argentina',
    'AT': 'Austria',
    'AU': 'Australia',
    'BE': 'Belgium',
    'BR': 'Brazil',
    'BG': 'Bulgaria',
    'CA': 'Canada',
    'CH': 'Switzerland',
    'CL': 'Chile',
    'CN': 'China',
    'CO': 'Colombia',
    'CR': 'Costa Rica',
    'CY': 'Cyprus',
    'CZ': 'Czech Republic',
    'DE': 'Germany',
    'DK': 'Denmark',
    'EG': 'Egypt',
    'ES': 'Spain',
    'FI': 'Finland',
    'FR': 'France',
    'GR': 'Greece',
    'HK': 'Hong Kong',
    'HU': 'Hungary',
    'ID': 'Indonesia',
    'IE': 'Ireland',
    'IL': 'Israel',
    'IN': 'India',
    'IS': 'Iceland',
    'IT': 'Italy',
    'JO': 'Jordan',
    'JP': 'Japan',
    'KR': 'South Korea',
    'LB': 'Lebanon',
    'LU': 'Luxembourg',
    'MT': 'Malta',
    'MX': 'Mexico',
    'MY': 'Malaysia',
    'NL': 'Netherlands',
    'NO': 'Norway',
    'NZ': 'New Zealand',
    'PE': 'Peru',
    'PH': 'Philippines',
    'PL': 'Poland',
    'PT': 'Portugal',
    'QA': 'Qatar',
    'RO': 'Romania',
    'RU': 'Russia',
    'SA': 'Saudi Arabia',
    'SE': 'Sweden',
    'SG': 'Singapore',
    'TH': 'Thailand',
    'TR': 'Turkey',
    'TW': 'Taiwan',
    'UK': 'United Kingdom',
    'US': 'United States',
    'AE': 'United Arab Emirates',
    'VN': 'Vietnam',
    'ZA': 'South Africa',
    // Full country names (for consistency)
    'Argentina': 'Argentina',
    'Australia': 'Australia',
    'Austria': 'Austria',
    'Belgium': 'Belgium',
    'Brazil': 'Brazil',
    'Bulgaria': 'Bulgaria',
    'Canada': 'Canada',
    'Chile': 'Chile',
    'China': 'China',
    'Colombia': 'Colombia',
    'Costa Rica': 'Costa Rica',
    'Cyprus': 'Cyprus',
    'Czech Republic': 'Czech Republic',
    'Denmark': 'Denmark',
    'Egypt': 'Egypt',
    'Finland': 'Finland',
    'France': 'France',
    'Germany': 'Germany',
    'Greece': 'Greece',
    'Hong Kong': 'Hong Kong',
    'Hungary': 'Hungary',
    'Iceland': 'Iceland',
    'India': 'India',
    'Indonesia': 'Indonesia',
    'Ireland': 'Ireland',
    'Israel': 'Israel',
    'Italy': 'Italy',
    'Japan': 'Japan',
    'Jordan': 'Jordan',
    'Lebanon': 'Lebanon',
    'Luxembourg': 'Luxembourg',
    'Malaysia': 'Malaysia',
    'Malta': 'Malta',
    'Mexico': 'Mexico',
    'Netherlands': 'Netherlands',
    'New Zealand': 'New Zealand',
    'Norway': 'Norway',
    'Peru': 'Peru',
    'Philippines': 'Philippines',
    'Poland': 'Poland',
    'Portugal': 'Portugal',
    'Qatar': 'Qatar',
    'Romania': 'Romania',
    'Russia': 'Russia',
    'Saudi Arabia': 'Saudi Arabia',
    'Singapore': 'Singapore',
    'South Africa': 'South Africa',
    'South Korea': 'South Korea',
    'Spain': 'Spain',
    'Sweden': 'Sweden',
    'Switzerland': 'Switzerland',
    'Taiwan': 'Taiwan',
    'Thailand': 'Thailand',
    'Turkey': 'Turkey',
    'United Arab Emirates': 'United Arab Emirates',
    'United Kingdom': 'United Kingdom',
    'United States': 'United States',
    'Vietnam': 'Vietnam'
  };

  const getCountryDisplayName = (countryCode) => {
    return countryNames[countryCode] || countryCode;
  };

  // Enhanced country toggle with better logic
  const handleCountryToggle = (country) => {
    if (country === 'ALL') {
      // Toggle all countries
      if (filters.country.length === countries.length) {
        // If all are selected, deselect all
        setFilters(prev => ({
          ...prev,
          country: []
        }));
      } else {
        // Select all countries
        setFilters(prev => ({
          ...prev,
          country: [...countries]
        }));
      }
    } else {
      // Toggle individual country
      setFilters(prev => ({
        ...prev,
        country: prev.country.includes(country)
          ? prev.country.filter(c => c !== country)
          : [...prev.country, country]
      }));
    }
    setCurrentPage(1); // Reset to first page when filtering
  };



  // Enhanced clear filters with confirmation for extensive selections
  const handleClearFilters = () => {
    const hasExtensiveFilters = filters.country.length > 5 ||
      filters.tuitionMin || filters.tuitionMax ||
      filters.cgpaMin || filters.cgpaMax ||
      filters.type || searchQuery;

    if (hasExtensiveFilters) {
      const confirmClear = window.confirm('Are you sure you want to clear all filters? This will reset your current selection.');
      if (!confirmClear) return;
    }

    setFilters({ country: [], tuitionMin: '', tuitionMax: '', cgpaMin: '', cgpaMax: '', type: '' });
    setSearchQuery('');
    setCurrentPage(1);
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setCurrentPage(1); // Reset to first page when searching
  };

  // Enhanced filter change with validation
  const handleFilterChange = (key, value) => {
    let validatedValue = value;

    // Validate numeric inputs
    if (['tuitionMin', 'tuitionMax'].includes(key)) {
      // Allow empty string or valid positive numbers
      if (value !== '' && (isNaN(value) || parseFloat(value) < 0)) {
        return; // Don't update if invalid
      }
      validatedValue = value === '' ? '' : parseFloat(value).toString();
    }

    if (['cgpaMin', 'cgpaMax'].includes(key)) {
      // CGPA should be between 0 and 4
      if (value !== '' && (isNaN(value) || parseFloat(value) < 0 || parseFloat(value) > 4)) {
        return; // Don't update if invalid
      }
      validatedValue = value === '' ? '' : parseFloat(value).toString();
    }

    // Additional validation for min/max relationships
    setFilters(prev => {
      const newFilters = { ...prev, [key]: validatedValue };

      // Ensure min is not greater than max
      if (key === 'tuitionMin' && newFilters.tuitionMax && parseFloat(validatedValue) > parseFloat(newFilters.tuitionMax)) {
        newFilters.tuitionMax = validatedValue;
      }
      if (key === 'tuitionMax' && newFilters.tuitionMin && parseFloat(validatedValue) < parseFloat(newFilters.tuitionMin)) {
        newFilters.tuitionMin = validatedValue;
      }
      if (key === 'cgpaMin' && newFilters.cgpaMax && parseFloat(validatedValue) > parseFloat(newFilters.cgpaMax)) {
        newFilters.cgpaMax = validatedValue;
      }
      if (key === 'cgpaMax' && newFilters.cgpaMin && parseFloat(validatedValue) < parseFloat(newFilters.cgpaMin)) {
        newFilters.cgpaMin = validatedValue;
      }

      return newFilters;
    });

    setCurrentPage(1); // Reset to first page when filtering
  };

  const handleSortChange = (newSortBy) => {
    if (newSortBy === sortBy) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(newSortBy);
      setSortOrder('asc');
    }
    setCurrentPage(1); // Reset to first page when sorting
  };

  const handleUniversitySelection = (id) => {
    setSelectedUniversities(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else if (newSet.size < 4) {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleBookmarkToggle = (universityId, isCurrentlyBookmarked) => {
    try {
      let newSet;
      if (isCurrentlyBookmarked) {
        setBookmarkedUniversities(prev => {
          newSet = new Set(prev);
          newSet.delete(universityId);
          return newSet;
        });
      } else {
        setBookmarkedUniversities(prev => {
          newSet = new Set([...prev, universityId]);
          return newSet;
        });
      }

      // Save to localStorage
      setTimeout(() => {
        if (newSet) {
          localStorage.setItem('bookmarkedUniversities', JSON.stringify([...newSet]));
        }
      }, 0);

      console.log(`University ${universityId} ${isCurrentlyBookmarked ? 'removed from' : 'added to'} bookmarks`);
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  const handleUniversityClick = (universityId) => {
    console.log('Navigating to university:', universityId);
    navigate(`/universities/${universityId}`);
  };

  const handleCompareSelected = () => {
    const selectedIds = Array.from(selectedUniversities);
    const selectedUnis = universities.filter(uni => selectedIds.includes(uni.id));

    console.log('Comparing universities:', selectedUnis);

    // Create comparison data
    const comparisonData = {
      universities: selectedUnis,
      timestamp: new Date().toISOString()
    };

    // Store in localStorage for the comparison page
    localStorage.setItem('universityComparison', JSON.stringify(comparisonData));

    // Navigate to comparison page
    navigate('/compare');
  };

  // Since we're using server-side filtering and sorting, we use universities directly
  const filteredUniversities = universities;

  return (
    <div style={{ backgroundColor: '#f5f7fb', minHeight: '100vh' }}>
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
      `}</style>

      {/* Hero Header */}
      <div style={{
        background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
        color: 'white',
        padding: '4rem 5%',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          backgroundImage: 'url(https://images.unsplash.com/photo-1523050854058-8df90110c9f1?ixlib=rb-4.0.3)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          opacity: 0.1,
          zIndex: 0
        }} />

        <div style={{ position: 'relative', zIndex: 1 }}>
          <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', fontWeight: '700' }}>
            Find Your Perfect University
          </h1>
          <p style={{ fontSize: '1.1rem', maxWidth: '600px', margin: '0 auto', opacity: 0.9 }}>
            Search through thousands of universities worldwide
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        maxWidth: '800px',
        margin: '-30px auto 40px',
        padding: '0 5%',
        position: 'relative',
        zIndex: 10
      }}>
        <div style={{ position: 'relative' }}>
          <div style={{
            position: 'absolute',
            left: '20px',
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: '1.5rem',
            zIndex: 2
          }}>🔍</div>
          <input
            type="text"
            placeholder="Search universities by name, city, or country..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            style={{
              width: '100%',
              padding: '15px 60px 15px 60px',
              fontSize: '1rem',
              border: 'none',
              borderRadius: '50px',
              boxShadow: '0 5px 25px rgba(0, 0, 0, 0.15)',
              outline: 'none'
            }}
          />
          {searchQuery && (
            <button
              onClick={() => handleSearchChange('')}
              style={{
                position: 'absolute',
                right: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                fontSize: '1.2rem',
                color: '#666',
                cursor: 'pointer',
                padding: '4px',
                borderRadius: '50%'
              }}
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Login Prompt for Comparison Feature */}
      {!isAuthenticated && (
        <div style={{
          maxWidth: '800px',
          margin: '0 auto 20px',
          padding: '0 5%'
        }}>
          <div style={{
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffeaa7 100%)',
            border: '1px solid #ffeaa7',
            borderRadius: '12px',
            padding: '1rem 1.5rem',
            textAlign: 'center',
            boxShadow: '0 3px 12px rgba(255, 234, 167, 0.3)'
          }}>
            <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>🔐</span>
            <strong style={{ color: '#856404' }}>Want to compare universities?</strong>
            <span style={{ color: '#856404', marginLeft: '0.5rem' }}>
              <a href="/login" style={{ color: '#856404', textDecoration: 'underline', fontWeight: '600' }}>
                Log in
              </a> to unlock the comparison feature and compare up to 4 universities side by side!
            </span>
          </div>
        </div>
      )}

      {/* Controls */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto 30px',
        padding: '0 5%',
        display: 'flex',
        gap: '15px',
        flexWrap: 'wrap',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <button
          onClick={() => setShowFilters(!showFilters)}
          style={{
            padding: '12px 25px',
            background: showFilters ? '#2563eb' : 'white',
            color: showFilters ? 'white' : '#2563eb',
            border: showFilters ? 'none' : '2px solid #2563eb',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)'
          }}
        >
          🔧 Filters
          {Object.values(filters).some(val => Array.isArray(val) ? val.length > 0 : val !== '') && (
            <span style={{
              background: '#dc2626',
              color: 'white',
              borderRadius: '50%',
              width: '8px',
              height: '8px',
              display: 'inline-block'
            }} />
          )}
        </button>

        <button
          onClick={() => {
            if (!isAuthenticated) {
              alert('🔐 Please log in to use the comparison feature!\n\nThe comparison tool allows you to compare up to 4 universities side by side with detailed information.');
              return;
            }
            setComparisonMode(!comparisonMode);
            if (!comparisonMode) {
              // Clear selections when exiting comparison mode
              setSelectedUniversities(new Set());
            }
          }}
          style={{
            padding: '12px 25px',
            background: comparisonMode ? '#dc2626' : 'white',
            color: comparisonMode ? 'white' : '#dc2626',
            border: comparisonMode ? 'none' : '2px solid #dc2626',
            borderRadius: '50px',
            cursor: 'pointer',
            fontWeight: '600',
            fontSize: '1rem',
            boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)',
            position: 'relative',
            opacity: !isAuthenticated ? 0.7 : 1
          }}
          title={!isAuthenticated ? 'Please log in to use comparison feature' : 'Compare universities side by side'}
        >
          📊 Compare ({selectedUniversities.size}/4)
          {!isAuthenticated && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#dc3545',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '0.7rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              🔒
            </span>
          )}
          {selectedUniversities.size > 0 && isAuthenticated && (
            <span style={{
              position: 'absolute',
              top: '-8px',
              right: '-8px',
              background: '#28a745',
              color: 'white',
              borderRadius: '50%',
              width: '20px',
              height: '20px',
              fontSize: '0.8rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}>
              {selectedUniversities.size}
            </span>
          )}
        </button>

        {selectedUniversities.size >= 2 && isAuthenticated && (
          <button
            onClick={() => handleCompareSelected()}
            style={{
              padding: '12px 25px',
              background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: '0 3px 12px rgba(40, 167, 69, 0.3)',
              animation: 'fadeInUp 0.3s ease-out'
            }}
          >
            ⚡ Compare Selected
          </button>
        )}

        {selectedUniversities.size > 0 && comparisonMode && isAuthenticated && (
          <button
            onClick={() => setSelectedUniversities(new Set())}
            style={{
              padding: '12px 25px',
              background: 'white',
              color: '#dc3545',
              border: '2px solid #dc3545',
              borderRadius: '50px',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: '1rem',
              boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)'
            }}
          >
            🗑️ Clear Selection
          </button>
        )}

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'white',
          padding: '8px 15px',
          borderRadius: '50px',
          boxShadow: '0 3px 12px rgba(0, 0, 0, 0.1)'
        }}>
          <label style={{ fontWeight: '600', color: '#1d4ed8', fontSize: '0.9rem' }}>Sort:</label>
          <select
            value={sortBy}
            onChange={(e) => handleSortChange(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              color: '#495057',
              fontWeight: '500',
              cursor: 'pointer',
              outline: 'none',
              fontSize: '0.9rem'
            }}
          >
            <option value="ranking">🏆 Ranking</option>
            <option value="tuition">💰 Tuition</option>
            <option value="acceptance">📈 Acceptance</option>
            <option value="name">📝 Name</option>
          </select>
          <button
            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.2rem',
              cursor: 'pointer',
              padding: '0 5px',
              color: '#2563eb'
            }}
          >
            {sortOrder === 'asc' ? '↑' : '↓'}
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1400px',
        margin: '0 auto',
        padding: '0 5% 40px',
        display: 'flex',
        gap: '30px',
        alignItems: 'flex-start'
      }}>
        {/* Clean Filters Sidebar */}
        {showFilters && (
          <div style={{
            background: 'white',
            borderRadius: '16px',
            padding: '24px',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            minWidth: '300px',
            maxWidth: '300px',
            animation: 'fadeInUp 0.3s ease-out',
            border: '1px solid #e5e7eb',
            position: 'sticky',
            top: '20px',
            maxHeight: 'calc(100vh - 40px)',
            overflowY: 'auto'
          }}>
            {/* Simple Header */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: '30px',
              paddingBottom: '16px',
              borderBottom: '2px solid #f3f4f6'
            }}>
              <h3 style={{
                margin: 0,
                color: '#1f2937',
                fontSize: '1.25rem',
                fontWeight: '600',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🎯 Filters
              </h3>
              <button
                onClick={handleClearFilters}
                style={{
                  background: '#f9fafb',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  color: '#6b7280',
                  fontWeight: '500',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#fef2f2';
                  e.target.style.borderColor = '#fca5a5';
                  e.target.style.color = '#dc2626';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = '#f9fafb';
                  e.target.style.borderColor = '#d1d5db';
                  e.target.style.color = '#6b7280';
                }}
              >
                Clear All
              </button>
            </div>

            {/* Active Filters - Only show if there are active filters */}
            {(filters.country.length > 0 || filters.tuitionMin || filters.tuitionMax || filters.cgpaMin || filters.cgpaMax || filters.type) && (
              <div style={{
                background: '#eff6ff',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '24px',
                border: '1px solid #dbeafe'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  fontWeight: '600',
                  color: '#1e40af',
                  marginBottom: '8px'
                }}>
                  Active Filters
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                  {filters.country.map(country => (
                    <span key={country} style={{
                      background: '#2563eb',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {country}
                    </span>
                  ))}
                  {filters.tuitionMin && (
                    <span style={{
                      background: '#059669',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      Min: ${filters.tuitionMin}
                    </span>
                  )}
                  {filters.tuitionMax && (
                    <span style={{
                      background: '#059669',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      Max: ${filters.tuitionMax}
                    </span>
                  )}
                  {filters.type && (
                    <span style={{
                      background: '#7c3aed',
                      color: 'white',
                      padding: '2px 8px',
                      borderRadius: '6px',
                      fontSize: '0.75rem',
                      fontWeight: '500'
                    }}>
                      {filters.type}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Country Filter */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                🌍 Countries
                {filters.country.length > 0 && (
                  <span style={{
                    background: '#2563eb',
                    color: 'white',
                    borderRadius: '50%',
                    width: '18px',
                    height: '18px',
                    fontSize: '0.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '600'
                  }}>
                    {filters.country.length}
                  </span>
                )}
                {filters.country.length === countries.length && (
                  <span style={{
                    background: '#10b981',
                    color: 'white',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    fontSize: '0.7rem',
                    fontWeight: '600'
                  }}>
                    All
                  </span>
                )}
              </label>

              {/* Regional and All Countries Options */}
              <div style={{ marginBottom: '12px' }}>
                {/* All Countries Toggle */}
                <label
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    background: filters.country.length === countries.length
                      ? 'linear-gradient(135deg, #d1fae5 0%, #a7f3d0 100%)'
                      : '#f0f9ff',
                    border: filters.country.length === countries.length
                      ? '2px solid #10b981'
                      : '2px solid #0ea5e9',
                    transition: 'all 0.2s ease',
                    fontWeight: '600',
                    marginBottom: '8px'
                  }}
                  onMouseEnter={(e) => {
                    if (filters.country.length !== countries.length) {
                      e.currentTarget.style.background = 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)';
                      e.currentTarget.style.borderColor = '#3b82f6';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (filters.country.length !== countries.length) {
                      e.currentTarget.style.background = '#f0f9ff';
                      e.currentTarget.style.borderColor = '#0ea5e9';
                    }
                  }}
                >
                  <input
                    type="checkbox"
                    checked={filters.country.length === countries.length}
                    onChange={() => handleCountryToggle('ALL')}
                    style={{
                      accentColor: '#10b981',
                      width: '16px',
                      height: '16px',
                      cursor: 'pointer'
                    }}
                  />
                  <span style={{
                    fontSize: '0.875rem',
                    fontWeight: '700',
                    color: filters.country.length === countries.length ? '#065f46' : '#0c4a6e',
                    flex: 1
                  }}>
                    🌐 All Countries ({countries.length})
                  </span>
                  {filters.country.length === countries.length && (
                    <span style={{ fontSize: '0.8rem', color: '#10b981' }}>✓</span>
                  )}
                </label>


              </div>

              {/* Individual Countries */}
              <div style={{
                display: 'grid',
                gap: '6px',
                maxHeight: '200px',
                overflowY: 'auto',
                padding: '4px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                background: '#fafafa'
              }}>
                {countries.map(country => (
                  <label
                    key={country}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      cursor: 'pointer',
                      padding: '8px 12px',
                      borderRadius: '6px',
                      background: filters.country.includes(country) ? '#eff6ff' : 'white',
                      border: filters.country.includes(country) ? '1px solid #3b82f6' : '1px solid #e5e7eb',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseEnter={(e) => {
                      if (!filters.country.includes(country)) {
                        e.currentTarget.style.background = '#f0f9ff';
                        e.currentTarget.style.borderColor = '#0ea5e9';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!filters.country.includes(country)) {
                        e.currentTarget.style.background = 'white';
                        e.currentTarget.style.borderColor = '#e5e7eb';
                      }
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={filters.country.includes(country)}
                      onChange={() => handleCountryToggle(country)}
                      style={{
                        accentColor: '#2563eb',
                        width: '16px',
                        height: '16px',
                        cursor: 'pointer'
                      }}
                    />
                    <span style={{
                      fontSize: '0.875rem',
                      fontWeight: filters.country.includes(country) ? '600' : '400',
                      color: filters.country.includes(country) ? '#1e40af' : '#374151',
                      flex: 1
                    }}>
                      {getCountryDisplayName(country)}
                    </span>
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#6b7280',
                      fontWeight: '500',
                      background: '#f3f4f6',
                      padding: '2px 6px',
                      borderRadius: '4px'
                    }}>
                      {country}
                    </span>
                  </label>
                ))}
              </div>

              {/* Country Statistics */}
              <div style={{
                marginTop: '12px',
                padding: '8px 12px',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}>
                <div style={{
                  fontSize: '0.75rem',
                  color: '#64748b',
                  textAlign: 'center'
                }}>
                  {filters.country.length === 0
                    ? `Showing all ${countries.length} countries`
                    : `${filters.country.length} of ${countries.length} countries selected`
                  }
                </div>
              </div>
            </div>

            {/* Tuition Fee Filter */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px',
                display: 'block'
              }}>
                💰 Tuition Fee (USD)
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    placeholder="Min (e.g. 10000)"
                    value={filters.tuitionMin}
                    onChange={(e) => handleFilterChange('tuitionMin', e.target.value)}
                    min="0"
                    max="100000"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${filters.tuitionMin && filters.tuitionMax && parseFloat(filters.tuitionMin) > parseFloat(filters.tuitionMax) ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = filters.tuitionMin && filters.tuitionMax && parseFloat(filters.tuitionMin) > parseFloat(filters.tuitionMax) ? '#ef4444' : '#d1d5db';
                    }}
                  />
                </div>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>—</span>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    placeholder="Max (e.g. 50000)"
                    value={filters.tuitionMax}
                    onChange={(e) => handleFilterChange('tuitionMax', e.target.value)}
                    min="0"
                    max="100000"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${filters.tuitionMin && filters.tuitionMax && parseFloat(filters.tuitionMin) > parseFloat(filters.tuitionMax) ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = filters.tuitionMin && filters.tuitionMax && parseFloat(filters.tuitionMin) > parseFloat(filters.tuitionMax) ? '#ef4444' : '#d1d5db';
                    }}
                  />
                </div>
              </div>
            </div>

            {/* CGPA Filter */}
            <div style={{ marginBottom: '32px' }}>
              <label style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px',
                display: 'block'
              }}>
                📊 Required CGPA
              </label>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Min (e.g. 3.0)"
                    value={filters.cgpaMin}
                    onChange={(e) => handleFilterChange('cgpaMin', e.target.value)}
                    min="0"
                    max="4"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${filters.cgpaMin && filters.cgpaMax && parseFloat(filters.cgpaMin) > parseFloat(filters.cgpaMax) ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = filters.cgpaMin && filters.cgpaMax && parseFloat(filters.cgpaMin) > parseFloat(filters.cgpaMax) ? '#ef4444' : '#d1d5db';
                    }}
                  />
                </div>
                <span style={{ color: '#6b7280', fontWeight: '500' }}>—</span>
                <div style={{ flex: 1 }}>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="Max (e.g. 4.0)"
                    value={filters.cgpaMax}
                    onChange={(e) => handleFilterChange('cgpaMax', e.target.value)}
                    min="0"
                    max="4"
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${filters.cgpaMin && filters.cgpaMax && parseFloat(filters.cgpaMin) > parseFloat(filters.cgpaMax) ? '#ef4444' : '#d1d5db'}`,
                      borderRadius: '8px',
                      fontSize: '0.875rem',
                      outline: 'none',
                      transition: 'border-color 0.2s ease'
                    }}
                    onFocus={(e) => {
                      e.target.style.borderColor = '#2563eb';
                    }}
                    onBlur={(e) => {
                      e.target.style.borderColor = filters.cgpaMin && filters.cgpaMax && parseFloat(filters.cgpaMin) > parseFloat(filters.cgpaMax) ? '#ef4444' : '#d1d5db';
                    }}
                  />
                </div>
              </div>
              <div style={{
                marginTop: '6px',
                fontSize: '0.75rem',
                color: '#6b7280',
                textAlign: 'center'
              }}>
                Scale: 0.0 - 4.0
              </div>
            </div>

            {/* University Type Filter */}
            <div style={{ marginBottom: '24px' }}>
              <label style={{
                fontSize: '0.95rem',
                fontWeight: '600',
                color: '#374151',
                marginBottom: '12px',
                display: 'block'
              }}>
                🏛️ University Type
              </label>
              <select
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '0.875rem',
                  cursor: 'pointer',
                  background: 'white',
                  color: '#374151',
                  outline: 'none',
                  transition: 'border-color 0.2s ease'
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = '#2563eb';
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = '#d1d5db';
                }}
              >
                <option value="">All Types</option>
                <option value="public">Public Universities</option>
                <option value="private">Private Universities</option>
              </select>
            </div>

            {/* Quick Presets */}
            <div style={{
              background: '#f0fdf4',
              borderRadius: '12px',
              padding: '16px',
              border: '1px solid #bbf7d0'
            }}>
              <div style={{
                fontSize: '0.875rem',
                fontWeight: '600',
                color: '#166534',
                marginBottom: '12px'
              }}>
                ⚡ Quick Presets
              </div>
              <div style={{ display: 'grid', gap: '8px' }}>
                <button
                  onClick={() => {
                    setFilters({
                      country: [],
                      tuitionMin: '',
                      tuitionMax: '15000',
                      cgpaMin: '',
                      cgpaMax: '',
                      type: ''
                    });
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    background: '#dcfce7',
                    border: '1px solid #22c55e',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    color: '#166534',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#bbf7d0';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#dcfce7';
                  }}
                >
                  💚 Budget Friendly (Under $15k)
                </button>
                <button
                  onClick={() => {
                    setFilters({
                      country: [],
                      tuitionMin: '',
                      tuitionMax: '',
                      cgpaMin: '',
                      cgpaMax: '3.5',
                      type: ''
                    });
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    background: '#fef3c7',
                    border: '1px solid #f59e0b',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    color: '#92400e',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#fde68a';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#fef3c7';
                  }}
                >
                  📚 Moderate Requirements (CGPA ≤ 3.5)
                </button>
                <button
                  onClick={() => {
                    setFilters({
                      country: [],
                      tuitionMin: '',
                      tuitionMax: '',
                      cgpaMin: '',
                      cgpaMax: '',
                      type: 'public'
                    });
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    background: '#eff6ff',
                    border: '1px solid #3b82f6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    color: '#1e40af',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#dbeafe';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#eff6ff';
                  }}
                >
                  🏛️ Public Universities Only
                </button>
                <button
                  onClick={() => {
                    setFilters({
                      country: [],
                      tuitionMin: '',
                      tuitionMax: '',
                      cgpaMin: '',
                      cgpaMax: '',
                      type: ''
                    });
                    setCurrentPage(1);
                  }}
                  style={{
                    padding: '8px 12px',
                    background: '#f3e8ff',
                    border: '1px solid #8b5cf6',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    fontWeight: '500',
                    color: '#5b21b6',
                    textAlign: 'left',
                    transition: 'all 0.2s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = '#e9d5ff';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = '#f3e8ff';
                  }}
                >
                  🔄 Reset All Filters
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Results Section */}
        <div style={{ flex: 1 }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '25px',
            padding: '15px 20px',
            background: 'white',
            borderRadius: '12px',
            boxShadow: '0 3px 12px rgba(0, 0, 0, 0.05)'
          }}>
            <div style={{ color: '#495057' }}>
              <span style={{ fontWeight: '700', color: '#1d4ed8', fontSize: '1.1rem' }}>
                {totalUniversities}
              </span>
              {' '}universities found
            </div>
            <div style={{ color: '#6c757d', fontSize: '0.9rem' }}>
              Showing {((currentPage - 1) * universitiesPerPage) + 1}-{Math.min(currentPage * universitiesPerPage, totalUniversities)} of {totalUniversities}
            </div>
          </div>

          {loading && (
            <div style={{ textAlign: 'center', padding: '4rem' }}>
              <LoadingSpinner size="large" message="Loading universities..." />
            </div>
          )}

          {error && !loading && (
            <div style={{
              textAlign: 'center',
              padding: '3rem',
              background: 'white',
              borderRadius: '15px',
              border: '2px solid #f5c6cb'
            }}>
              <h3 style={{ color: '#dc3545' }}>⚠️ Error Loading Universities</h3>
              <p style={{ color: '#666' }}>{error}</p>
              <button
                onClick={fetchUniversities}
                style={{
                  background: '#dc3545',
                  color: 'white',
                  border: 'none',
                  padding: '10px 25px',
                  borderRadius: '50px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                Try Again
              </button>
            </div>
          )}

          {!loading && !error && (
            <>
              {filteredUniversities.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                  gap: '25px',
                  marginBottom: '40px'
                }}>
                  {filteredUniversities.map((university, index) => (
                    <div
                      key={university.id}
                      style={{
                        animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                      }}
                    >
                      <UniversityCard
                        university={university}
                        onClick={handleUniversityClick}
                        showBookmark={true}
                        isBookmarked={bookmarkedUniversities.has(university.id)}
                        onBookmarkToggle={handleBookmarkToggle}
                        showComparison={comparisonMode && isAuthenticated}
                        isSelected={selectedUniversities.has(university.id)}
                        onSelectionToggle={handleUniversitySelection}
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{
                  textAlign: 'center',
                  padding: '4rem 2rem',
                  background: 'white',
                  borderRadius: '20px',
                  border: '2px dashed #dee2e6'
                }}>
                  <div style={{
                    fontSize: '4rem',
                    marginBottom: '1.5rem',
                    opacity: 0.6,
                    animation: 'bounce 2s infinite'
                  }}>🔍</div>
                  <h3 style={{
                    fontSize: '1.5rem',
                    fontWeight: '700',
                    color: '#1d4ed8',
                    marginBottom: '1rem'
                  }}>
                    No universities found
                  </h3>
                  <p style={{
                    color: '#6c757d',
                    fontSize: '1rem',
                    marginBottom: '2rem',
                    maxWidth: '400px',
                    margin: '0 auto 2rem auto'
                  }}>
                    Try adjusting your search criteria or filters to discover more amazing universities.
                  </p>
                  <button
                    onClick={handleClearFilters}
                    style={{
                      padding: '12px 30px',
                      background: '#2563eb',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '1rem'
                    }}
                  >
                    🔄 Clear All Filters
                  </button>
                </div>
              )}

              {totalPages > 1 && (
                <div style={{
                  display: 'flex',
                  justifyContent: 'center',
                  gap: '10px',
                  marginTop: '40px',
                  flexWrap: 'wrap'
                }}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '10px 20px',
                      background: currentPage === 1 ? 'white' : '#2563eb',
                      color: currentPage === 1 ? '#666' : 'white',
                      border: currentPage === 1 ? '2px solid #dee2e6' : 'none',
                      borderRadius: '8px',
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                      opacity: currentPage === 1 ? 0.5 : 1,
                      fontWeight: '500'
                    }}
                  >
                    ← Previous
                  </button>

                  {/* Page numbers */}
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }

                    return (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        style={{
                          padding: '10px 20px',
                          background: pageNum === currentPage ? '#2563eb' : 'white',
                          color: pageNum === currentPage ? 'white' : '#495057',
                          border: pageNum === currentPage ? 'none' : '2px solid #dee2e6',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          fontWeight: pageNum === currentPage ? '600' : '500',
                          minWidth: '50px'
                        }}
                      >
                        {pageNum}
                      </button>
                    );
                  })}

                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '10px 20px',
                      background: currentPage === totalPages ? 'white' : '#2563eb',
                      color: currentPage === totalPages ? '#666' : 'white',
                      border: currentPage === totalPages ? '2px solid #dee2e6' : 'none',
                      borderRadius: '8px',
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                      opacity: currentPage === totalPages ? 0.5 : 1,
                      fontWeight: '500'
                    }}
                  >
                    Next →
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default SearchPage;