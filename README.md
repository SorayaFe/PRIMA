# PRIMA

Repository for the module "Prototyping interactive media-applications and games" at Furtwangen University

## Final Assignment: Greed

- Title: Greed
- Author: Soraya Ferdani
- Year and season: SoSe 2022
- Curriculum and semester: OMB6
- Course this development was created in: PRIMA
- Docent: Prof. Dipl.-Ing. Jirka R. Dell'Oro-Friedl, HFU
- Link to the Game: [Greed](https://sorayafe.github.io/PRIMA/Greed/index.html)
- Link to the source code: [Code](https://github.com/SorayaFe/PRIMA/tree/main/Greed)
- Link to the design document: [Design](https://sorayafe.github.io/PRIMA/Greed/Assets/Docs/design.pdf), [Items](https://sorayafe.github.io/PRIMA/Greed/Assets/Docs/item-cheat-sheet.pdf), [Enemies](https://sorayafe.github.io/PRIMA/Greed/Assets/Docs/enemies.pdf)
- Description for users on how to interact: WASD to move, Arrow-keys to shoot, for additional explaination refer to the initial game dialog

### Checklist

|  Nr | Criterion           | Explanation                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| --: | ------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|   1 | Units and Positions | - 0: bottom left corner of walkable area (floor) is 0 <br> - Game in x/y plane (makes positioning easier) <br> - 1: 1 Meter <br> - Avatar: 1x1 <br> - Enemies: different sizes                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|   2 | Hierarchy           | Game/<br>+-Room/<br>&#124; +-Floor<br>&#124; +-Walls/<br>&#124; &#124; +-Wall<br>&#124; &#124; +-...<br>&#124; +-Enemies/<br>&#124; &#124; +-Enemy<br>&#124; &#124; +-...<br>&#124; +-Door<br>&#124; +-Button<br>&#124; +-Timer<br>+-Shop/<br>&#124; +-Floor<br>&#124; +-Restock<br>&#124; +-ItemSlots/<br>&#124; &#124; +-Itemslot<br>&#124; &#124; +-PriceTag<br>&#124; &#124; +-...<br>&#124; +-Walls/<br>&#124; &#124; +-Wall<br>&#124; &#124; +-...<br>+-Projectile<br>+-...<br>+-Avatar<br>+-Sound <br> <br> - Game divided into Room, Shop and Sound <br> - Room node contains everything nedded in the main room <br> - Shop node contains everything nedded in the shop <br> - Sound node contains all sounds <br> - Things needed in both the room and the shop (Avatar, Projectile) are directly attached to Game <br> - This setup creates a logical structure for the game |
|   3 | Editor              | Created in Editor: <br> - Floor <br> - Walls <br> - Door <br> - Button <br> - Restock <br> - Created in editor because they are static <br> - Rest: created in code because they are dynamically added later on and/or interact with other components                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                   |
|   4 | Scriptcomponents    | - Different scripts for different enemy behavior <br> - ShootScript for enemies of type SHOOT_2, SHOOT_2_ROTATE and SHOOT_4 <br> - FollowScript for enemies of type FOLLOW and FOLLOW_SHOOT <br> - ChargeScript for enemies of type CHARGE <br> - All these scripts extend BasicScript <br> - Useful for realizing different enemy <br> - Scripts were useful for outsourcing the enemy behavior into a different file so the enemy class doesn't become too complex and for assigning different behavior (adding different script) depending on enemy type                                                                                                                                                                                                                                                                                                                             |
|   5 | Extend              | Extend Node: <br> - ItemSlot <br> - PriceTag <br> - Avatar <br> - Enemy <br> - Projectile <br> Extend Mutable: <br> - GameState <br> Extend ComponentScript: <br> - BasicScript <br> - Extending classes was useful for using given attributes and methods and adding own functionality that is needed for the game                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
|   6 | Sound               | - Hit <br> - Die <br> - Item collected <br> - Coins added <br> - Health added <br> - Background music <br> - Restock items <br> - Projectile falls to ground <br> - Enemy dies <br> - Enemies appear <br> - Door opens/closes <br> - Sound has no speific placement, since the game is 2D                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
|   7 | VUI                 | Interface shows all important infos: <br> - Health <br> - Coins <br> - Projectile and avatar stats <br> - For an explaination of all stats check the initial game dialog                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
|   8 | Event-System        | - Event if last enemy is killed: enemy sends out event if it was the last one killed &rarr; add new enemeies if timer is still running and rounds are remaining; or open shop door if no rounds are remaining <br> - Event if enemy touches avatar &rarr; enemy sends out event and avatar hit gets triggered <br> - Usefull for reacting to things that are happening in a different class/file/node for example: enemy send out event if it's the last one killed which is something Main needs to know about                                                                                                                                                                                                                                                                                                                                                                         |
|   9 | External Data       | - items.json: contains all items <br> - enemies.json: contains all enemies <br> - Paramters are the needed values to create enemy/item i.e. health, type, size etc. <br> - Paramters also contain the sprite to be used to create the enemy/item <br> - For further information look at the design document, there you can find the interfaces <br> - External data was useful for storing all the different kinds of items and enemies and the loading them into the game                                                                                                                                                                                                                                                                                                                                                                                                              |
|   A | Light               | - The regular light is an ambient light, iluminating the floor and the walls <br> - Collecting the item 'cursed lightbulb' turns down the color of the ambient light, making everything look darker <br> - The avatar then has a point light attached to them illuminating only those parts of the floor close to them <br> - Enemies / items etc. are still fully lit so they are easier to spot and the game doesn't become harder than it already is :) <br> - For testing purposes you can put cursed true in you sessionStorage to have the effects of the 'cursed lightbuld' item                                                                                                                                                                                                                                                                                                 |
|   B | Physics             | - Rigidbodies used for: Enemies, Walls, Avatar, ItemSlots, Door, Button, Projectiles, Restock <br> - Rigibodies that are triggers: ItemSlots, Projectiles, Button <br> - Used for realizing collisions (for example with walls etc,) <br> - Useful for collision and trigger events (for example if projectile collides with enemy &rarr; enemy looses health)                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          |
|   C | Net                 |                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
|   D | State Machines      | - ComponentStateMachine used for bosses: <br> - SkeletonStateMachine <br> - FireStateMachine <br> - Useful for realizing more complex enemy behavior                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|   E | Animation           | - Sprites used for: Avatar, Items, Enemies, Button, Door, PriceTags, Timer, Restock <br> - Sprites that have a continously playing animation: Avatar, Enemies, Timer                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    |
|     |
