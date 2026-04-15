-- 批量插入缺失的化学元素数据
-- 元素周期表完整数据（1-118 号元素）

-- 已存在的元素：1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 24, 25, 26, 28, 29, 30, 47, 53, 56, 79, 80, 82
-- 缺失的元素：21, 22, 23, 27, 31-46, 48-52, 54, 55, 57-78, 81, 83-118

-- 插入缺失的元素（使用 INSERT IGNORE 避免重复）
INSERT IGNORE INTO `chemistry_element` (`atomic_number`, `symbol`, `name_zh`, `name_en`, `atomic_mass`, `category`, `period`, `group_num`, `block`, `electron_configuration`, `valence_electrons`, `state_at_stp`, `color`, `electronegativity`, `melting_point`, `boiling_point`, `density`, `color_code`) VALUES

-- 第 4 周期过渡金属（缺失）
(21, 'Sc', '钪', 'Scandium', 44.956, 'transition_metal', 4, 3, 'd', '[Ar] 3d¹ 4s²', 3, 'solid', '银白色', 1.36, 1541, 2836, 2.985, '#E3E3E3'),
(22, 'Ti', '钛', 'Titanium', 47.867, 'transition_metal', 4, 4, 'd', '[Ar] 3d² 4s²', 4, 'solid', '银灰色', 1.54, 1668, 3287, 4.506, '#BFC2C7'),
(23, 'V', '钒', 'Vanadium', 50.942, 'transition_metal', 4, 5, 'd', '[Ar] 3d³ 4s²', 5, 'solid', '银灰色', 1.63, 1910, 3407, 6.11, '#A6A6A6'),
(27, 'Co', '钴', 'Cobalt', 58.933, 'transition_metal', 4, 9, 'd', '[Ar] 3d⁷ 4s²', 9, 'solid', '银灰色', 1.88, 1495, 2927, 8.86, '#F090A0'),
(31, 'Ga', '镓', 'Gallium', 69.723, 'post_transition_metal', 4, 13, 'p', '[Ar] 3d¹⁰ 4s² 4p¹', 3, 'solid', '银白色', 1.81, 29.76, 2204, 5.907, '#C28F95'),
(32, 'Ge', '锗', 'Germanium', 72.63, 'metalloid', 4, 14, 'p', '[Ar] 3d¹⁰ 4s² 4p²', 4, 'solid', '灰白色', 2.01, 938.25, 2833, 5.323, '#668F8F'),
(33, 'As', '砷', 'Arsenic', 74.922, 'metalloid', 4, 15, 'p', '[Ar] 3d¹⁰ 4s² 4p³', 5, 'solid', '金属灰', 2.18, 817, 614, 5.776, '#BD80E3'),
(34, 'Se', '硒', 'Selenium', 78.971, 'nonmetal', 4, 16, 'p', '[Ar] 3d¹⁰ 4s² 4p⁴', 6, 'solid', '灰色', 2.55, 221, 685, 4.79, '#FFA100'),
(35, 'Br', '溴', 'Bromine', 79.904, 'halogen', 4, 17, 'p', '[Ar] 3d¹⁰ 4s² 4p⁵', 7, 'liquid', '红棕色', 2.96, -7.2, 58.8, 3.122, '#A62929'),
(36, 'Kr', '氪', 'Krypton', 83.798, 'noble_gas', 4, 18, 'p', '[Ar] 3d¹⁰ 4s² 4p⁶', 8, 'gas', '无色', 3.0, 115.79, 119.93, 0.003733, '#5CB8D1'),

-- 第 5 周期（缺失）
(37, 'Rb', '铷', 'Rubidium', 85.468, 'alkali_metal', 5, 1, 's', '[Kr] 5s¹', 1, 'solid', '银白色', 0.82, 39.31, 688, 1.532, '#702EB0'),
(38, 'Sr', '锶', 'Strontium', 87.62, 'alkaline_earth_metal', 5, 2, 's', '[Kr] 5s²', 2, 'solid', '银白色', 0.95, 777, 1382, 2.64, '#007B00'),
(39, 'Y', '钇', 'Yttrium', 88.906, 'transition_metal', 5, 3, 'd', '[Kr] 4d¹ 5s²', 3, 'solid', '银白色', 1.22, 1526, 3336, 4.469, '#94FFFF'),
(40, 'Zr', '锆', 'Zirconium', 91.224, 'transition_metal', 5, 4, 'd', '[Kr] 4d² 5s²', 4, 'solid', '银灰色', 1.33, 1855, 4409, 6.506, '#94E0E0'),
(41, 'Nb', '铌', 'Niobium', 92.906, 'transition_metal', 5, 5, 'd', '[Kr] 4d⁴ 5s¹', 5, 'solid', '钢灰色', 1.6, 2477, 4744, 8.57, '#73C2C9'),
(42, 'Mo', '钼', 'Molybdenum', 95.95, 'transition_metal', 5, 6, 'd', '[Kr] 4d⁵ 5s¹', 6, 'solid', '银白色', 2.16, 2623, 4639, 10.22, '#54B5B5'),
(43, 'Tc', '锝', 'Technetium', 98, 'transition_metal', 5, 7, 'd', '[Kr] 4d⁵ 5s²', 7, 'solid', '银灰色', 1.9, 2157, 4265, 11.5, '#3B9E9E'),
(44, 'Ru', '钌', 'Ruthenium', 101.07, 'transition_metal', 5, 8, 'd', '[Kr] 4d⁷ 5s¹', 8, 'solid', '银白色', 2.2, 2334, 4150, 12.37, '#248B8B'),
(45, 'Rh', '铑', 'Rhodium', 102.91, 'transition_metal', 5, 9, 'd', '[Kr] 4d⁸ 5s¹', 9, 'solid', '银白色', 2.28, 1964, 3695, 12.41, '#0A7D8E'),
(46, 'Pd', '钯', 'Palladium', 106.42, 'transition_metal', 5, 10, 'd', '[Kr] 4d¹⁰', 10, 'solid', '银白色', 2.2, 1554.9, 2963, 12.02, '#006985'),
(48, 'Cd', '镉', 'Cadmium', 112.41, 'transition_metal', 5, 12, 'd', '[Kr] 4d¹⁰ 5s²', 12, 'solid', '银白色', 1.69, 321.07, 767, 8.69, '#FFD98F'),
(49, 'In', '铟', 'Indium', 114.82, 'post_transition_metal', 5, 13, 'p', '[Kr] 4d¹⁰ 5s² 5p¹', 3, 'solid', '银白色', 1.78, 156.6, 2072, 7.31, '#A67573'),
(50, 'Sn', '锡', 'Tin', 118.71, 'post_transition_metal', 5, 14, 'p', '[Kr] 4d¹⁰ 5s² 5p²', 4, 'solid', '银白色', 1.96, 231.93, 2602, 7.287, '#668080'),
(51, 'Sb', '锑', 'Antimony', 121.76, 'metalloid', 5, 15, 'p', '[Kr] 4d¹⁰ 5s² 5p³', 5, 'solid', '银白色', 2.05, 630.63, 1587, 6.685, '#9E63B5'),
(52, 'Te', '碲', 'Tellurium', 127.6, 'metalloid', 5, 16, 'p', '[Kr] 4d¹⁰ 5s² 5p⁴', 6, 'solid', '银白色', 2.1, 449.51, 988, 6.232, '#D47A00'),
(54, 'Xe', '氙', 'Xenon', 131.29, 'noble_gas', 5, 18, 'p', '[Kr] 4d¹⁰ 5s² 5p⁶', 8, 'gas', '无色', 2.6, 161.4, 165.03, 0.005887, '#429EB0'),

-- 第 6 周期（缺失）
(55, 'Cs', '铯', 'Cesium', 132.91, 'alkali_metal', 6, 1, 's', '[Xe] 6s¹', 1, 'solid', '金黄色', 0.79, 28.44, 671, 1.873, '#428296'),
(57, 'La', '镧', 'Lanthanum', 138.91, 'lanthanide', 6, 3, 'f', '[Xe] 5d¹ 6s²', 3, 'solid', '银白色', 1.1, 920, 3464, 6.145, '#70D4FF'),
(58, 'Ce', '铈', 'Cerium', 140.12, 'lanthanide', 6, 3, 'f', '[Xe] 4f¹ 5d¹ 6s²', 4, 'solid', '铁灰色', 1.12, 795, 3443, 6.77, '#FFFFC7'),
(59, 'Pr', '镨', 'Praseodymium', 140.91, 'lanthanide', 6, 3, 'f', '[Xe] 4f³ 6s²', 3, 'solid', '银白色', 1.13, 935, 3520, 6.773, '#D9FFC7'),
(60, 'Nd', '钕', 'Neodymium', 144.24, 'lanthanide', 6, 3, 'f', '[Xe] 4f⁴ 6s²', 3, 'solid', '银白色', 1.14, 1024, 3074, 7.007, '#C7FFC7'),
(61, 'Pm', '钷', 'Promethium', 145, 'lanthanide', 6, 3, 'f', '[Xe] 4f⁵ 6s²', 3, 'solid', '银白色', 1.13, 1042, 3000, 7.26, '#A3FFC7'),
(62, 'Sm', '钐', 'Samarium', 150.36, 'lanthanide', 6, 3, 'f', '[Xe] 4f⁶ 6s²', 3, 'solid', '银白色', 1.17, 1072, 1794, 7.52, '#8FFFC7'),
(63, 'Eu', '铕', 'Europium', 151.96, 'lanthanide', 6, 3, 'f', '[Xe] 4f⁷ 6s²', 3, 'solid', '银白色', 1.2, 826, 1529, 5.243, '#61FFC7'),
(64, 'Gd', '钆', 'Gadolinium', 157.25, 'lanthanide', 6, 3, 'f', '[Xe] 4f⁷ 5d¹ 6s²', 3, 'solid', '银白色', 1.2, 1312, 3273, 7.895, '#45FFC7'),
(65, 'Tb', '铽', 'Terbium', 158.93, 'lanthanide', 6, 3, 'f', '[Xe] 4f⁹ 6s²', 3, 'solid', '银白色', 1.2, 1356, 3230, 8.229, '#30FFC7'),
(66, 'Dy', '镝', 'Dysprosium', 162.5, 'lanthanide', 6, 3, 'f', '[Xe] 4f¹⁰ 6s²', 3, 'solid', '银白色', 1.22, 1412, 2567, 8.55, '#1FFFC7'),
(67, 'Ho', '钬', 'Holmium', 164.93, 'lanthanide', 6, 3, 'f', '[Xe] 4f¹¹ 6s²', 3, 'solid', '银白色', 1.23, 1461, 2720, 8.795, '#00FF9C'),
(68, 'Er', '铒', 'Erbium', 167.26, 'lanthanide', 6, 3, 'f', '[Xe] 4f¹² 6s²', 3, 'solid', '银白色', 1.24, 1529, 2868, 9.066, '#00E675'),
(69, 'Tm', '铥', 'Thulium', 168.93, 'lanthanide', 6, 3, 'f', '[Xe] 4f¹³ 6s²', 3, 'solid', '银白色', 1.25, 1545, 1950, 9.321, '#00D452'),
(70, 'Yb', '镱', 'Ytterbium', 173.05, 'lanthanide', 6, 3, 'f', '[Xe] 4f¹⁴ 6s²', 3, 'solid', '银白色', 1.1, 824, 1196, 6.965, '#00BF38'),
(71, 'Lu', '镥', 'Lutetium', 174.97, 'lanthanide', 6, 3, 'd', '[Xe] 4f¹⁴ 5d¹ 6s²', 3, 'solid', '银白色', 1.27, 1652, 3402, 9.84, '#00AB24'),
(72, 'Hf', '铪', 'Hafnium', 178.49, 'transition_metal', 6, 4, 'd', '[Xe] 4f¹⁴ 5d² 6s²', 4, 'solid', '钢灰色', 1.3, 2233, 4603, 13.31, '#4DC2FF'),
(73, 'Ta', '钽', 'Tantalum', 180.95, 'transition_metal', 6, 5, 'd', '[Xe] 4f¹⁴ 5d³ 6s²', 5, 'solid', '蓝灰色', 1.5, 3017, 5458, 16.65, '#4DA6FF'),
(74, 'W', '钨', 'Tungsten', 183.84, 'transition_metal', 6, 6, 'd', '[Xe] 4f¹⁴ 5d⁴ 6s²', 6, 'solid', '钢灰色', 2.36, 3422, 5555, 19.25, '#2194D6'),
(75, 'Re', '铼', 'Rhenium', 186.21, 'transition_metal', 6, 7, 'd', '[Xe] 4f¹⁴ 5d⁵ 6s²', 7, 'solid', '银白色', 1.9, 3186, 5596, 21.02, '#267DAB'),
(76, 'Os', '锇', 'Osmium', 190.23, 'transition_metal', 6, 8, 'd', '[Xe] 4f¹⁴ 5d⁶ 6s²', 8, 'solid', '蓝灰色', 2.2, 3033, 5012, 22.61, '#266696'),
(77, 'Ir', '铱', 'Iridium', 192.22, 'transition_metal', 6, 9, 'd', '[Xe] 4f¹⁴ 5d⁷ 6s²', 9, 'solid', '银白色', 2.2, 2446, 4428, 22.56, '#175487'),
(78, 'Pt', '铂', 'Platinum', 195.08, 'transition_metal', 6, 10, 'd', '[Xe] 4f¹⁴ 5d⁹ 6s¹', 10, 'solid', '银白色', 2.28, 1768.3, 3825, 21.46, '#D0D0E3'),
(81, 'Tl', '铊', 'Thallium', 204.38, 'post_transition_metal', 6, 13, 'p', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p¹', 3, 'solid', '银白色', 1.62, 304, 1473, 11.85, '#A6544D'),
(83, 'Bi', '铋', 'Bismuth', 208.98, 'post_transition_metal', 6, 15, 'p', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p³', 5, 'solid', '银白色', 2.02, 271.4, 1564, 9.807, '#9E4FB5'),
(84, 'Po', '钋', 'Polonium', 209, 'metalloid', 6, 16, 'p', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁴', 6, 'solid', '银白色', 2.0, 254, 962, 9.32, '#B54C4C'),
(85, 'At', '砹', 'Astatine', 210, 'halogen', 6, 17, 'p', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁵', 7, 'solid', '黑色', 2.2, 302, 337, 7, '#754F45'),
(86, 'Rn', '氡', 'Radon', 222, 'noble_gas', 6, 18, 'p', '[Xe] 4f¹⁴ 5d¹⁰ 6s² 6p⁶', 8, 'gas', '无色', 2.2, 202, 211.3, 0.00973, '#428296'),

-- 第 7 周期（缺失）
(87, 'Fr', '钫', 'Francium', 223, 'alkali_metal', 7, 1, 's', '[Rn] 7s¹', 1, 'solid', '银白色', 0.7, 27, 677, 1.87, '#420066'),
(88, 'Ra', '镭', 'Radium', 226, 'alkaline_earth_metal', 7, 2, 's', '[Rn] 7s²', 2, 'solid', '银白色', 0.9, 700, 1737, 5.5, '#007D00'),
(89, 'Ac', '锕', 'Actinium', 227, 'actinide', 7, 3, 'f', '[Rn] 6d¹ 7s²', 3, 'solid', '银白色', 1.1, 1051, 3198, 10.07, '#70ABFA'),
(90, 'Th', '钍', 'Thorium', 232.04, 'actinide', 7, 3, 'f', '[Rn] 6d² 7s²', 4, 'solid', '银白色', 1.3, 1748, 4788, 11.72, '#00BAFF'),
(91, 'Pa', '镤', 'Protactinium', 231.04, 'actinide', 7, 3, 'f', '[Rn] 5f² 6d¹ 7s²', 5, 'solid', '银灰色', 1.5, 1568, 4027, 15.37, '#00A1FF'),
(92, 'U', '铀', 'Uranium', 238.03, 'actinide', 7, 3, 'f', '[Rn] 5f³ 6d¹ 7s²', 6, 'solid', '银白色', 1.38, 1135, 4131, 18.95, '#008FFF'),
(93, 'Np', '镎', 'Neptunium', 237, 'actinide', 7, 3, 'f', '[Rn] 5f⁴ 6d¹ 7s²', 5, 'solid', '银白色', 1.36, 644, 3902, 20.25, '#0080FF'),
(94, 'Pu', '钚', 'Plutonium', 244, 'actinide', 7, 3, 'f', '[Rn] 5f⁶ 7s²', 6, 'solid', '银白色', 1.28, 640, 3228, 19.84, '#006BFF'),
(95, 'Am', '镅', 'Americium', 243, 'actinide', 7, 3, 'f', '[Rn] 5f⁷ 7s²', 3, 'solid', '银白色', 1.3, 1176, 2011, 13.69, '#545CF2'),
(96, 'Cm', '锔', 'Curium', 247, 'actinide', 7, 3, 'f', '[Rn] 5f⁷ 6d¹ 7s²', 3, 'solid', '银白色', 1.3, 1345, 3110, 13.51, '#785CE3'),
(97, 'Bk', '锫', 'Berkelium', 247, 'actinide', 7, 3, 'f', '[Rn] 5f⁹ 7s²', 4, 'solid', '银白色', 1.3, 986, 2627, 14.79, '#8A4FE3'),
(98, 'Cf', '锎', 'Californium', 251, 'actinide', 7, 3, 'f', '[Rn] 5f¹⁰ 7s²', 3, 'solid', '银白色', 1.3, 900, 1743, 15.1, '#A133E3'),
(99, 'Es', '锿', 'Einsteinium', 252, 'actinide', 7, 3, 'f', '[Rn] 5f¹¹ 7s²', 3, 'solid', '银白色', 1.3, 860, 996, 8.84, '#B030DB'),
(100, 'Fm', '镄', 'Fermium', 257, 'actinide', 7, 3, 'f', '[Rn] 5f¹² 7s²', 3, 'solid', '银白色', 1.3, 1527, NULL, NULL, '#B040DB'),
(101, 'Md', '钔', 'Mendelevium', 258, 'actinide', 7, 3, 'f', '[Rn] 5f¹³ 7s²', 3, 'solid', '银白色', 1.3, 827, NULL, NULL, '#B940D6'),
(102, 'No', '锘', 'Nobelium', 259, 'actinide', 7, 3, 'f', '[Rn] 5f¹⁴ 7s²', 2, 'solid', '银白色', 1.3, 827, NULL, NULL, '#BD40D6'),
(103, 'Lr', '铹', 'Lawrencium', 266, 'actinide', 7, 3, 'd', '[Rn] 5f¹⁴ 7s² 7p¹', 3, 'solid', '银白色', 1.3, 1627, NULL, NULL, '#C740D6');

-- 第 7 周期超重元素（缺失）
INSERT IGNORE INTO `chemistry_element` (`atomic_number`, `symbol`, `name_zh`, `name_en`, `atomic_mass`, `category`, `period`, `group_num`, `block`, `electron_configuration`, `valence_electrons`, `state_at_stp`, `color`, `electronegativity`, `melting_point`, `boiling_point`, `density`, `color_code`) VALUES
(104, 'Rf', '𬬻', 'Rutherfordium', 267, 'transition_metal', 7, 4, 'd', '[Rn] 5f¹⁴ 6d² 7s²', 4, 'solid', '未知', 1.3, 2100, 5500, 23.2, '#CC00FF'),
(105, 'Db', '𬭊', 'Dubnium', 268, 'transition_metal', 7, 5, 'd', '[Rn] 5f¹⁴ 6d³ 7s²', 5, 'solid', '未知', 1.3, NULL, NULL, 29.3, '#D100FF'),
(106, 'Sg', '𬭳', 'Seaborgium', 269, 'transition_metal', 7, 6, 'd', '[Rn] 5f¹⁴ 6d⁴ 7s²', 6, 'solid', '未知', 1.3, NULL, NULL, 35.0, '#D900FF'),
(107, 'Bh', '𬭛', 'Bohrium', 270, 'transition_metal', 7, 7, 'd', '[Rn] 5f¹⁴ 6d⁵ 7s²', 7, 'solid', '未知', 1.3, NULL, NULL, 37.1, '#E000FF'),
(108, 'Hs', '𬭶', 'Hassium', 269, 'transition_metal', 7, 8, 'd', '[Rn] 5f¹⁴ 6d⁶ 7s²', 8, 'solid', '未知', 1.3, NULL, NULL, 40.7, '#E600FF'),
(109, 'Mt', '鿏', 'Meitnerium', 278, 'transition_metal', 7, 9, 'd', '[Rn] 5f¹⁴ 6d⁷ 7s²', 9, 'solid', '未知', 1.3, NULL, NULL, 37.4, '#EB00FF'),
(110, 'Ds', '𫟼', 'Darmstadtium', 281, 'transition_metal', 7, 10, 'd', '[Rn] 5f¹⁴ 6d⁸ 7s²', 10, 'solid', '未知', 1.3, NULL, NULL, 34.8, '#F000FF'),
(111, 'Rg', '𬬭', 'Roentgenium', 282, 'transition_metal', 7, 11, 'd', '[Rn] 5f¹⁴ 6d⁹ 7s²', 11, 'solid', '未知', 1.3, NULL, NULL, 28.7, '#F500FF'),
(112, 'Cn', '𫓧', 'Copernicium', 285, 'transition_metal', 7, 12, 'd', '[Rn] 5f¹⁴ 6d¹⁰ 7s²', 12, 'solid', '未知', 1.3, NULL, NULL, 23.7, '#F900FF'),
(113, 'Nh', '𫓷', 'Nihonium', 286, 'post_transition_metal', 7, 13, 'p', '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p¹', 3, 'solid', '未知', 1.3, 430, 1100, 16.0, '#FC00FF'),
(114, 'Fl', '𫓧', 'Flerovium', 289, 'post_transition_metal', 7, 14, 'p', '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p²', 4, 'solid', '未知', 1.3, 340, 420, 14.0, '#FF00FF'),
(115, 'Mc', '镆', 'Moscovium', 290, 'post_transition_metal', 7, 15, 'p', '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p³', 5, 'solid', '未知', 1.3, 670, 1400, 13.5, '#FF00FC'),
(116, 'Lv', '𫟷', 'Livermorium', 293, 'post_transition_metal', 7, 16, 'p', '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁴', 6, 'solid', '未知', 1.3, 709, 1085, 12.9, '#FF00F5'),
(117, 'Ts', '鿬', 'Tennessine', 294, 'halogen', 7, 17, 'p', '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁵', 7, 'solid', '未知', 1.3, 723, 883, 7.2, '#FF00EA'),
(118, 'Og', '鿫', 'Oganesson', 294, 'noble_gas', 7, 18, 'p', '[Rn] 5f¹⁴ 6d¹⁰ 7s² 7p⁶', 8, 'solid', '未知', 1.3, 325, 450, 5.0, '#FF00DB');
