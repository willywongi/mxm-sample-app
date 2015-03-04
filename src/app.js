var Word = React.createClass({
		render: function() {
			return (<h1>{this.props.text} </h1>);
		} 
	}),
	Genre = React.createClass({
		GENRES: {
			1152: "Hard Rock"
		},
		render: function() {
			return (<h3>{this.GENRES[this.props.genre]}</h3>);
		}
	}),
	Level = React.createClass({
		render: function() {
			var levelText = this.props.number + 1;
			return (<h3>Level {levelText}</h3>);
		}
	}),
	Score = React.createClass({
		render: function() {
			var scoreText = this.props.score + 0;
			return (<h3>Score: {scoreText}</h3>);
		}
	}),
	EmptyBox = React.createClass({
		render: function() {
			return <div className="pure-g empty-box"/>;
		}
		
	}),
	ResponseBox = React.createClass({
		getInitialState: function() {
			return {chosen: null};
		},
		handleClick: function(e) {
			var choice =  parseInt(e.target.getAttribute("data-choice"), 10);
			console.log('User choose choice', choice);
			this.setState({chosen: choice});
		},
		pickChoice: function(e) {
			console.log('check with server if choice is good');
		},
		render: function() {
			var chosen = this.state.chosen,
				// fixme: usare underscore? http://underscorejs.org/#range
				classes = [0, 1, 2, 3].map(function(i) {
					return React.addons.classSet({
						'png-choice': true,
						'png-chosen': chosen === i
					});
				});
			console.log(this.state);
			return (
			<div className="pure-g">
				<div className="pure-g">
					<div className="pure-u-1-2">
						<div className={classes[0]} onClick={this.handleClick} data-choice="0">
							{this.props.choices[0]}
						</div>
					</div>
					<div className="pure-u-1-2">
						<div className={classes[1]} onClick={this.handleClick} data-choice="1">
							{this.props.choices[1]}
						</div>
					</div>
				</div>
				<div className="pure-g">
					<div className="pure-u-1-2">
						<div className={classes[2]} onClick={this.handleClick} data-choice="2">
							{this.props.choices[2]}
						</div>
					</div>
					<div className="pure-u-1-2">
						<div className={classes[3]} onClick={this.handleClick} data-choice="3">
							{this.props.choices[3]}
						</div>
					</div>
				</div>
				<div className="pure-g">
					<button onClick={this.pickChoice}>Scegli</button>
				</div>
			</div>);
		}
	}),
	App = React.createClass({
		getInitialState: function() {
			return {
				ingame: false
			}
		},
		
		handleChangeRound: function(e) {
			this.setState({'round': e.target.value});
		},
		
		render: function() {
			if (this.state.ingame) {
				var word = <Word text={this.props.word} />,
					response = <ResponseBox choices={this.props.choices} />;
			} else {
				var word = <EmptyBox />,
					response = <EmptyBox />;
			}
			return (
			<div>
				<div className="pure-g">
					<div className="pure-u-1-2"><Genre genre={this.props.genre}/></div>
					<div className="pure-u-1-2"><Level number={this.props.level}/></div>
				</div>
				<div className="jumbo">
				{word}
				</div>
				<div>{response}</div>
			</div>
			);
		}
	});
$(document).ready(function() {
	var props = {
		genre: 1152,
		level: 0,
		'round': 0,
		players: 1,
		word: "light",
		choices: [
			"Metallica - Enter Sandman",
			"Speck&Strudel - Speck",
			"Bon Jovi - Forever",
			"Kiss - I was made for loving you"
		],
		chosen: null
	};
	React.render(<App {...props}/>, document.getElementById('content'));
});
	

